package com.moka.fleet.mobile.db

import android.content.Context
import androidx.room.*
import java.time.Instant

/**
 * ====================================================
 * MOKA Fleet Logistics - Android Native Room Database
 * ENTERPRISE OFFLINE PERSISTENCE LAYER
 * ====================================================
 */

@Entity(tableName = "vehicles")
data class VehicleEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "plate_number") val plateNumber: String,
    val model: String,
    @ColumnInfo(name = "fuel_type") val fuelType: String,
    @ColumnInfo(name = "nfc_card_id") val nfcCardId: String?,
    @ColumnInfo(name = "wallet_balance") val walletBalance: Double,
    @ColumnInfo(name = "daily_limit") val dailyLimit: Double,
    @ColumnInfo(name = "spent_today") val spentToday: Double
)

@Entity(tableName = "drivers")
data class DriverEntity(
    @PrimaryKey val id: String,
    val name: String,
    @ColumnInfo(name = "employee_id") val employeeId: String,
    @ColumnInfo(name = "license_number") val licenseNumber: String,
    @ColumnInfo(name = "nfc_card_id") val nfcCardId: String?,
    @ColumnInfo(name = "is_active") val isActive: Boolean
)

@Entity(tableName = "nfc_cards")
data class NfcCardEntity(
    @PrimaryKey @ColumnInfo(name = "card_number") val cardNumber: String,
    @ColumnInfo(name = "vehicle_id") val vehicleId: String?,
    @ColumnInfo(name = "driver_id") val driverId: String?,
    @ColumnInfo(name = "pin_hash") val pinHash: String,
    @ColumnInfo(name = "daily_liters_limit") val dailyLitersLimit: Double,
    @ColumnInfo(name = "is_active") val isActive: Boolean
)

@Entity(tableName = "transaction_queue")
data class OfflineTransactionEntity(
    @PrimaryKey val uuid: String,
    @ColumnInfo(name = "vehicle_id") val vehicleId: String,
    @ColumnInfo(name = "driver_id") val driverId: String,
    @ColumnInfo(name = "station_id") val stationId: String,
    @ColumnInfo(name = "pump_id") val pumpId: String,
    @ColumnInfo(name = "fuel_product_id") val fuelProductId: String,
    val liters: Double,
    @ColumnInfo(name = "price_per_liter") val pricePerLiter: Double,
    val amount: Double,
    @ColumnInfo(name = "transaction_date") val transactionDate: String,
    @ColumnInfo(name = "sync_status") val syncStatus: String, // "PENDING", "SUCCESS", "FAILED"
    @ColumnInfo(name = "retry_count") val retryCount: Int = 0
)

@Entity(tableName = "device_metadata")
data class DeviceMetadataEntity(
    @PrimaryKey val key: String,
    val value: String
)

@Dao
interface MokaDao {
    // Vehicles
    @Query("SELECT * FROM vehicles WHERE id = :id")
    suspend fun getVehicleById(id: String): VehicleEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVehicles(vehicles: List<VehicleEntity>)

    @Query("UPDATE vehicles SET wallet_balance = wallet_balance - :amount, spent_today = spent_today + :amount WHERE id = :id")
    suspend fun deductVehicleBalance(id: String, amount: Double)

    @Query("DELETE FROM vehicles")
    suspend fun deleteAllVehicles()

    // Drivers
    @Query("SELECT * FROM drivers WHERE id = :id")
    suspend fun getDriverById(id: String): DriverEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDrivers(drivers: List<DriverEntity>)

    @Query("DELETE FROM drivers")
    suspend fun deleteAllDrivers()

    // NFC Cards
    @Query("SELECT * FROM nfc_cards WHERE card_number = :cardNumber")
    suspend fun getNfcCard(cardNumber: String): NfcCardEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNfcCards(cards: List<NfcCardEntity>)

    @Query("DELETE FROM nfc_cards")
    suspend fun deleteAllNfcCards()

    // Transaction Queue (Offline refueling buffers)
    @Query("SELECT * FROM transaction_queue WHERE sync_status = 'PENDING'")
    suspend fun getPendingTransactions(): List<OfflineTransactionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: OfflineTransactionEntity)

    @Query("UPDATE transaction_queue SET sync_status = :status WHERE uuid = :uuid")
    suspend fun updateTransactionSyncStatus(uuid: String, status: String)

    @Query("UPDATE transaction_queue SET sync_status = 'SUCCESS' WHERE sync_status = 'PENDING'")
    suspend fun markAllAsSynced()

    // Device Metadata
    @Query("SELECT value FROM device_metadata WHERE `key` = :key")
    suspend fun getMetadataValue(key: String): String?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveMetadata(metadata: DeviceMetadataEntity)
}

@Database(
    entities = [
        VehicleEntity::class,
        DriverEntity::class,
        NfcCardEntity::class,
        OfflineTransactionEntity::class,
        DeviceMetadataEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class MokaRoomDatabase : RoomDatabase() {
    abstract fun mokaDao(): MokaDao

    companion object {
        @Volatile
        private var INSTANCE: MokaRoomDatabase? = null

        fun getDatabase(context: Context): MokaRoomDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MokaRoomDatabase::class.java,
                    "moka_enterprise_room.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
