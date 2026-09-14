package com.moka.fleet.mobile.sync

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID
import org.json.JSONObject
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL

/**
 * ====================================================
 * MOKA Fleet Logistics - Android Native Sync Engine
 * CLEAN ARCHITECTURE IMPLEMENTATION
 * ====================================================
 * Handles SQLite Offline Storage, Dynamic NFC Card Verification,
 * 168-hour Enterprise Lockout Protocol, and Background Auto Sync.
 */

class MobileDatabaseHelper(context: Context) : SQLiteOpenHelper(context, "moka_offline.db", null, 1) {
    override fun onCreate(db: SQLiteDatabase) {
        // Create Local Tables for complete Offline Autonomy
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS vehicles (
                id TEXT PRIMARY KEY,
                plate_number TEXT,
                model TEXT,
                fuel_type TEXT,
                nfc_card_id TEXT,
                wallet_balance REAL,
                daily_limit REAL,
                spent_today REAL
            )
        """)
        
        db.execSQL("""
            CREATE TABLE IF NOT EXISTS drivers (
                id TEXT PRIMARY KEY,
                name TEXT,
                employee_id TEXT,
                license_number TEXT,
                nfc_card_id TEXT,
                is_active INTEGER
            )
        """)

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS nfc_cards (
                card_number TEXT PRIMARY KEY,
                vehicle_id TEXT,
                driver_id TEXT,
                pin_hash TEXT,
                daily_liters_limit REAL,
                is_active INTEGER
            )
        """)

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS transaction_queue (
                uuid TEXT PRIMARY KEY,
                vehicle_id TEXT,
                driver_id TEXT,
                station_id TEXT,
                pump_id TEXT,
                fuel_product_id TEXT,
                liters REAL,
                price_per_liter REAL,
                amount REAL,
                transaction_date TEXT,
                sync_status TEXT, -- PENDING, SUCCESS, FAILED
                retry_count INTEGER DEFAULT 0
            )
        """)

        db.execSQL("""
            CREATE TABLE IF NOT EXISTS device_metadata (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS vehicles")
        db.execSQL("DROP TABLE IF EXISTS drivers")
        db.execSQL("DROP TABLE IF EXISTS nfc_cards")
        db.execSQL("DROP TABLE IF EXISTS transaction_queue")
        db.execSQL("DROP TABLE IF EXISTS device_metadata")
        onCreate(db)
    }
}

class MokaSyncEngine(private val context: Context, private val serverBaseUrl: String) {

    private val dbHelper = MobileDatabaseHelper(context)
    private val TAG = "MokaSyncEngine"

    init {
        // Initialize last sync time on first boot
        val db = dbHelper.writableDatabase
        val cursor = db.rawQuery("SELECT value FROM device_metadata WHERE key = 'last_sync_time'", null)
        if (!cursor.moveToFirst()) {
            db.execSQL("INSERT INTO device_metadata (key, value) VALUES ('last_sync_time', '${Instant.now()}')")
        }
        cursor.close()
    }

    /**
     * ENTERPRISE LOCK PROTOCOL (168 Hours / 7 Days Rule)
     * Verifies if the device has synchronized with the master server in the last 7 days.
     * If not, it disables NFC operations and displays "Synchronization Required".
     */
    fun checkEnterpriseLock(): Boolean {
        val lastSyncStr = getMetadata("last_sync_time") ?: return false
        val lastSyncInstant = Instant.parse(lastSyncStr)
        val now = Instant.now()
        
        val hoursSinceSync = ChronoUnit.HOURS.between(lastSyncInstant, now)
        val isLocked = hoursSinceSync >= 168

        if (isLocked) {
            Log.e(TAG, "CRITICAL: Device locked! Synchronization Required. Hours offline: $hoursSinceSync")
            setMetadata("device_status", "LOCKED")
        } else {
            setMetadata("device_status", "ACTIVE")
        }
        return isLocked
    }

    /**
     * DYNAMIC NFC CARD TRANSACTION CREATION (OFFLINE)
     * Verifies card pin and limit limits inside SQLite, then queues transaction.
     */
    fun processFuelTransactionOffline(
        cardNumber: String, 
        enteredPin: String, 
        litersRequired: Float, 
        pricePerLiter: Float,
        stationId: String,
        pumpId: String,
        productId: String
    ): JSONObject {
        
        if (checkEnterpriseLock()) {
            return JSONObject().apply {
                put("success", false)
                put("reason", "LOCK_PROTOCOL_TRIGGERED")
                put("message", "Device has been offline for over 7 Days. Synchronization Required!")
            }
        }

        val db = dbHelper.readableDatabase
        val cardCursor = db.rawQuery("SELECT * FROM nfc_cards WHERE card_number = ?", arrayOf(cardNumber))
        
        if (!cardCursor.moveToFirst()) {
            cardCursor.close()
            return JSONObject().apply {
                put("success", false)
                put("reason", "INVALID_CARD")
                put("message", "NFC Card not registered on this device.")
            }
        }

        val storedPinHash = cardCursor.getString(cardCursor.getColumnIndexOrThrow("pin_hash"))
        val isActive = cardCursor.getInt(cardCursor.getColumnIndexOrThrow("is_active")) == 1
        val vehicleId = cardCursor.getString(cardCursor.getColumnIndexOrThrow("vehicle_id"))
        val driverId = cardCursor.getString(cardCursor.getColumnIndexOrThrow("driver_id"))
        val dailyLitersLimit = cardCursor.getFloat(cardCursor.getColumnIndexOrThrow("daily_liters_limit"))
        cardCursor.close()

        if (!isActive) {
            return JSONObject().apply { put("success", false); put("reason", "CARD_BLOCKED") }
        }

        // Pin Hashing verification simulation
        if (storedPinHash != enteredPin) {
            return JSONObject().apply { put("success", false); put("reason", "INVALID_PIN") }
        }

        // Fetch Wallet balance & limit limit
        val vehCursor = db.rawQuery("SELECT * FROM vehicles WHERE id = ?", arrayOf(vehicleId))
        if (!vehCursor.moveToFirst()) {
            vehCursor.close()
            return JSONObject().apply { put("success", false); put("reason", "VEHICLE_NOT_FOUND") }
        }
        val walletBalance = vehCursor.getFloat(vehCursor.getColumnIndexOrThrow("wallet_balance"))
        val dailyLimit = vehCursor.getFloat(vehCursor.getColumnIndexOrThrow("daily_limit"))
        val spentToday = vehCursor.getFloat(vehCursor.getColumnIndexOrThrow("spent_today"))
        vehCursor.close()

        val requiredAmount = litersRequired * pricePerLiter

        if (walletBalance < requiredAmount) {
            return JSONObject().apply { put("success", false); put("reason", "INSUFFICIENT_FUNDS") }
        }

        if (spentToday + requiredAmount > dailyLimit || litersRequired > dailyLitersLimit) {
            return JSONObject().apply { put("success", false); put("reason", "LIMITS_EXCEEDED") }
        }

        // Offline Transaction is approved. Deduct local wallet & write transaction queue.
        val localDb = dbHelper.writableDatabase
        localDb.beginTransaction()
        try {
            // Deduct locally
            localDb.execSQL(
                "UPDATE vehicles SET wallet_balance = wallet_balance - ?, spent_today = spent_today + ? WHERE id = ?",
                arrayOf(requiredAmount, requiredAmount, vehicleId)
            )

            // Queue the transaction
            val txUuid = UUID.randomUUID().toString()
            localDb.execSQL("""
                INSERT INTO transaction_queue 
                (uuid, vehicle_id, driver_id, station_id, pump_id, fuel_product_id, liters, price_per_liter, amount, transaction_date, sync_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
            """, arrayOf(txUuid, vehicleId, driverId, stationId, pumpId, productId, litersRequired, pricePerLiter, requiredAmount, Instant.now().toString()))
            
            localDb.setTransactionSuccessful()
            
            return JSONObject().apply {
                put("success", true)
                put("txUuid", txUuid)
                put("amount", requiredAmount)
                put("message", "Offline transaction approved and queued.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Database error: ", e)
            return JSONObject().apply { put("success", false); put("reason", "DB_ERROR") }
        } finally {
            localDb.endTransaction()
        }
    }

    /**
     * DELTA MASTER DATA SYNCHRONIZATION (DOWNLOAD)
     * Syncs latest active vehicles, drivers, cards, and stations from the server.
     */
    fun performDeltaDownload(): Boolean {
        try {
            val url = URL("$serverBaseUrl/api/sync/download?deviceUuid=${getDeviceUuid()}")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = 5000

            if (conn.responseCode == 200) {
                val response = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(response)
                val delta = json.getJSONObject("delta")

                val localDb = dbHelper.writableDatabase
                localDb.beginTransaction()
                try {
                    // Update Local SQLite Master Data
                    // 1. Sync Vehicles
                    localDb.execSQL("DELETE FROM vehicles")
                    val vehiclesArr = delta.getJSONArray("vehicles")
                    for (i in 0 until vehiclesArr.length()) {
                        val v = vehiclesArr.getJSONObject(i)
                        localDb.execSQL("""
                            INSERT INTO vehicles (id, plate_number, model, fuel_type, nfc_card_id, wallet_balance, daily_limit, spent_today)
                            VALUES (?, ?, ?, ?, ?, 10000.0, 1500.0, 0.0)
                        """, arrayOf(v.getString("id"), v.getString("plateNumber"), v.getString("model"), v.getString("fuelType"), v.optString("nfcCardId", null)))
                    }

                    // 2. Sync Drivers
                    localDb.execSQL("DELETE FROM drivers")
                    val driversArr = delta.getJSONArray("drivers")
                    for (i in 0 until driversArr.length()) {
                        val d = driversArr.getJSONObject(i)
                        localDb.execSQL("""
                            INSERT INTO drivers (id, name, employee_id, license_number, nfc_card_id, is_active)
                            VALUES (?, ?, ?, ?, ?, ?)
                        """, arrayOf(d.getString("id"), d.getString("name"), d.getString("employeeId"), d.getString("licenseNumber"), d.optString("nfcCardId", null), if (d.getBoolean("isActive")) 1 else 0))
                    }

                    // 3. Sync NFC Cards
                    localDb.execSQL("DELETE FROM nfc_cards")
                    val cardsArr = delta.getJSONArray("nfcCards")
                    for (i in 0 until cardsArr.length()) {
                        val c = cardsArr.getJSONObject(i)
                        localDb.execSQL("""
                            INSERT INTO nfc_cards (card_number, vehicle_id, driver_id, pin_hash, daily_liters_limit, is_active)
                            VALUES (?, ?, ?, ?, ?, ?)
                        """, arrayOf(c.getString("cardNumber"), c.optString("vehicleId", null), c.optString("driverId", null), c.getString("pinHash"), c.getDouble("dailyLitersLimit"), if (c.getBoolean("isActive")) 1 else 0))
                    }

                    // Update last sync timestamp on complete success
                    localDb.execSQL("UPDATE device_metadata SET value = ? WHERE key = 'last_sync_time'", arrayOf(Instant.now().toString()))
                    localDb.setTransactionSuccessful()
                    Log.i(TAG, "Delta Synchronization complete. Device active.")
                    return true
                } finally {
                    localDb.endTransaction()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Delta download failed: ", e)
        }
        return false
    }

    /**
     * OFFLINE TRANSACTION STREAMING (UPLOAD)
     * Syncs local transaction queue to server using incremental synchronization.
     */
    fun performUploadSync(): Boolean {
        val db = dbHelper.readableDatabase
        val cursor = db.rawQuery("SELECT * FROM transaction_queue WHERE sync_status = 'PENDING'", null)
        if (cursor.count == 0) {
            cursor.close()
            return true // Nothing to sync
        }

        val txArray = JSONArray()
        while (cursor.moveToNext()) {
            val tx = JSONObject().apply {
                put("uuid", cursor.getString(cursor.getColumnIndexOrThrow("uuid")))
                put("vehicleId", cursor.getString(cursor.getColumnIndexOrThrow("vehicle_id")))
                put("driverId", cursor.getString(cursor.getColumnIndexOrThrow("driver_id")))
                put("stationId", cursor.getString(cursor.getColumnIndexOrThrow("station_id")))
                put("pumpId", cursor.getString(cursor.getColumnIndexOrThrow("pump_id")))
                put("fuelProductId", cursor.getString(cursor.getColumnIndexOrThrow("fuel_product_id")))
                put("liters", cursor.getDouble(cursor.getColumnIndexOrThrow("liters")))
                put("pricePerLiter", cursor.getDouble(cursor.getColumnIndexOrThrow("price_per_liter")))
                put("amount", cursor.getDouble(cursor.getColumnIndexOrThrow("amount")))
                put("transactionDate", cursor.getString(cursor.getColumnIndexOrThrow("transaction_date")))
                put("isOffline", true)
            }
            txArray.put(tx)
        }
        cursor.close()

        try {
            val url = URL("$serverBaseUrl/api/sync/upload")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true

            val uploadPayload = JSONObject().apply {
                put("deviceUuid", getDeviceUuid())
                put("transactions", txArray)
            }

            conn.outputStream.use { os ->
                os.write(uploadPayload.toString().toByteArray())
            }

            if (conn.responseCode == 200) {
                // Update transaction queue sync statuses on success
                val localDb = dbHelper.writableDatabase
                localDb.execSQL("UPDATE transaction_queue SET sync_status = 'SUCCESS' WHERE sync_status = 'PENDING'")
                Log.i(TAG, "Successfully uploaded queued transactions.")
                return true
            }
        } catch (e: Exception) {
            Log.e(TAG, "Transaction upload failed: ", e)
        }
        return false
    }

    private fun getDeviceUuid(): String {
        return "MOKA-HW-MOB-1001" // Example HW registered UUID
    }

    private fun getMetadata(key: String): String? {
        val db = dbHelper.readableDatabase
        val cursor = db.rawQuery("SELECT value FROM device_metadata WHERE key = ?", arrayOf(key))
        var value: String? = null
        if (cursor.moveToFirst()) {
            value = cursor.getString(0)
        }
        cursor.close()
        return value
    }

    private fun setMetadata(key: String, value: String) {
        val db = dbHelper.writableDatabase
        db.execSQL("INSERT OR REPLACE INTO device_metadata (key, value) VALUES (?, ?)", arrayOf(key, value))
    }
}
