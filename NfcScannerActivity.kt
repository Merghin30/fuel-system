package com.moka.fleet.mobile.ui

import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.moka.fleet.mobile.sync.MokaSyncEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.Locale

/**
 * =========================================================================
 * MOKA Fleet Logistics - Android Native RFID/NFC Scanner Activity
 * HIGH-SECURITY SECURE ENCLAVE OFFLINE AUTHORIZATION
 * =========================================================================
 * Designed for rugged enterprise PDA scanners (e.g., Honeywell, Zebra).
 * Features real-time NFC hardware integration, automated offline security checks,
 * PIN pin verification, and custom 168-hour hard lockout system controls.
 */
class NfcScannerActivity : ComponentActivity() {

    private var nfcAdapter: NfcAdapter? = null
    private var pendingIntent: PendingIntent? = null
    private var intentFiltersArray: Array<IntentFilter>? = null
    private var techListsArray: Array<Array<String>>? = null

    private lateinit var syncEngine: MokaSyncEngine
    private val TAG = "NfcScannerActivity"

    // Component State
    private var scannedCardUid = mutableStateOf<String?>(null)
    private var deviceLocked = mutableStateOf(false)
    private var pinValue = mutableStateOf("")
    private var litersValue = mutableStateOf("50")
    private var selectedProduct = mutableStateOf("Diesel Extra")
    private var transactionStatusMessage = mutableStateOf<String?>(null)
    private var isSuccessState = mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 1. Initialize MOKA Offline Sync Engine
        syncEngine = MokaSyncEngine(this, "https://moka-fleet-master.example.com")
        
        // 2. Perform 168-Hour Enterprise Lockdown watchdog check
        deviceLocked.value = syncEngine.checkEnterpriseLock()

        // 3. Initialize NFC Reader Hardware Subsystem
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        if (nfcAdapter == null) {
            Toast.makeText(this, "NFC Hardware not supported on this device.", Toast.LENGTH_LONG).show()
        }

        // Configure foreground dispatch so our app intercepts all physical RFID/NFC tags
        val intent = Intent(this, javaClass).apply {
            addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_MUTABLE)

        val ndefFilter = IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED).apply {
            try {
                addDataType("*/*")
            } catch (e: IntentFilter.MalformedMimeTypeException) {
                Log.e(TAG, "Mime type configuration error", e)
            }
        }
        techListsArray = arrayOf(
            arrayOf(android.nfc.tech.NfcA::class.java.name),
            arrayOf(android.nfc.tech.NfcB::class.java.name),
            arrayOf(android.nfc.tech.NfcF::class.java.name),
            arrayOf(android.nfc.tech.NfcV::class.java.name),
            arrayOf(android.nfc.tech.IsoDep::class.java.name),
            arrayOf(android.nfc.tech.MifareClassic::class.java.name),
            arrayOf(android.nfc.tech.MifareUltralight::class.java.name)
        )
        intentFiltersArray = arrayOf(ndefFilter, IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED))

        // 4. Set Custom Material Display UI Theme (Cosmic Slate matching React client)
        setContent {
            MaterialTheme {
                NfcScannerScreen()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Enable foreground dispatch of NFC tags while active
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, intentFiltersArray, techListsArray)
        // Refresh lock status on resuming activity
        deviceLocked.value = syncEngine.checkEnterpriseLock()
    }

    override fun onPause() {
        super.onPause()
        // Disable foreground dispatch to yield sensor to default system handler
        nfcAdapter?.disableForegroundDispatch(this)
    }

    /**
     * INTERCEPT PHYSICAL TAG OR SMART CARD SCAN EVENTS
     */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleNfcIntent(intent)
    }

    private fun handleNfcIntent(intent: Intent) {
        val action = intent.action
        if (NfcAdapter.ACTION_NDEF_DISCOVERED == action ||
            NfcAdapter.ACTION_TECH_DISCOVERED == action ||
            NfcAdapter.ACTION_TAG_DISCOVERED == action) {

            val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
            if (tag != null) {
                val uidBytes = tag.id
                val uidHex = bytesToHex(uidBytes)
                
                scannedCardUid.value = uidHex
                transactionStatusMessage.value = "NFC CARD DETECTED\nUID Code: $uidHex\nPlease enter security PIN."
                isSuccessState.value = true
                
                Log.i(TAG, "Interceded NFC RFID Card Tag ID: $uidHex")
                Toast.makeText(this, "NFC Card Swiped: $uidHex", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun bytesToHex(bytes: ByteArray): String {
        val sb = java.lang.StringBuilder()
        for (b in bytes) {
            sb.append(String.format("%02X:", b))
        }
        if (sb.isNotEmpty()) {
            sb.setLength(sb.length - 1)
        }
        return sb.toString().uppercase(Locale.ROOT)
    }

    /**
     * AUTHORIZE AND RECORD REFUELING TRANSACTION OFF-GRID
     */
    private fun authorizeOfflineTransaction() {
        val cardId = scannedCardUid.value
        val pin = pinValue.value
        val litersStr = litersValue.value

        if (cardId.isNullOrEmpty()) {
            transactionStatusMessage.value = "ERROR: Please swipe/tap physical NFC card first."
            isSuccessState.value = false
            return
        }

        if (pin.length < 4) {
            transactionStatusMessage.value = "ERROR: Security PIN must be at least 4 digits."
            isSuccessState.value = false
            return
        }

        val liters = litersStr.toFloatOrNull()
        if (liters == null || liters <= 0f) {
            transactionStatusMessage.value = "ERROR: Please specify a valid liters amount."
            isSuccessState.value = false
            return
        }

        // Use IO Dispatcher to run SQLite query and decryption operations
        CoroutineScope(Dispatchers.IO).launch {
            val response: JSONObject = syncEngine.processFuelTransactionOffline(
                cardNumber = cardId,
                enteredPin = pin,
                litersRequired = liters,
                pricePerLiter = 4.35f, // Standard Diesel price
                stationId = "STATION-JED-009",
                pumpId = "PUMP-04",
                productId = "PROD-DSL-EXT"
            )

            val success = response.getBoolean("success")
            val message = response.getString("message")
            
            CoroutineScope(Dispatchers.Main).launch {
                isSuccessState.value = success
                if (success) {
                    val txUuid = response.getString("txUuid")
                    val amount = response.getDouble("amount")
                    transactionStatusMessage.value = "TRANSACTION APPROVED!\n\n" +
                            "UUID: $txUuid\n" +
                            "Fuel: $liters Liters ($selectedProduct)\n" +
                            "Cost: $amount SAR (Offline Cryptographic Signed)"
                    // Clear fields
                    pinValue.value = ""
                } else {
                    val reason = response.optString("reason", "UNKNOWN_ERROR")
                    transactionStatusMessage.value = "TRANSACTION REJECTED: $reason\n\n$message"
                }
            }
        }
    }

    /**
     * COMPOSE NATIVE GRAPHICS INTERFACE
     */
    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun NfcScannerScreen() {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF030712)) // Deep slate-950
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Header Info Bar
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "MOKA FLEET TERMINAL",
                    color = Color(0xFFF97316), // Orange-500
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 1.5.sp
                )
                Text(
                    text = "Device ID: MOKA-HW-MOB-1001",
                    color = Color.LightGray,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(top = 2.dp)
                )
                Divider(
                    color = Color(0xFF1E293B), // Slate-800
                    thickness = 1.dp,
                    modifier = Modifier.padding(vertical = 12.dp)
                )
            }

            // Main State Module
            if (deviceLocked.value) {
                // LOCKOUT WATCHDOG SCREEN (168h Offline Timeout triggered)
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF450A0A)), // Rose-950
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color(0xFF991B1B), RoundedCornerShape(16.dp))
                        .padding(8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "⚠ SECURITY LOCKOUT ACTIVE",
                            color = Color(0xFFEF4444), // Rose-500
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "This PDA has exceeded the 168-hour maximum offline storage timeframe without server validation.\n\nAll cryptographic RFID authorization protocols have been disabled to prevent compliance violations.",
                            color = Color(0xFFFECACA),
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = {
                                CoroutineScope(Dispatchers.IO).launch {
                                    val synced = syncEngine.performDeltaDownload() && syncEngine.performUploadSync()
                                    if (synced) {
                                        deviceLocked.value = syncEngine.checkEnterpriseLock()
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                        ) {
                            Text("Force Connection Sync", color = Color.White)
                        }
                    }
                }
            } else {
                // ACTIVE OPERATIONAL MODE
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Card State Badge
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                if (scannedCardUid.value != null) Color(0xFF064E3B) else Color(0xFF0F172A),
                                shape = RoundedCornerShape(12.dp)
                            )
                            .border(
                                1.dp,
                                if (scannedCardUid.value != null) Color(0xFF059669) else Color(0xFF334155),
                                shape = RoundedCornerShape(12.dp)
                            )
                            .padding(16.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = if (scannedCardUid.value != null) "✓ RFID CARD DETECTED" else "🎴 TAP RFID CARD TO SENSOR",
                                color = if (scannedCardUid.value != null) Color(0xFF34D399) else Color(0xFFF97316),
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            if (scannedCardUid.value != null) {
                                Text(
                                    text = "UID: ${scannedCardUid.value}",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Transaction Entry Fields
                    OutlinedTextField(
                        value = pinValue.value,
                        onValueChange = { if (it.length <= 6) pinValue.value = it },
                        label = { Text("Operator/Driver PIN", color = Color.Gray) },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        colors = TextFieldDefaults.outlinedTextFieldColors(
                            textColor = Color.White,
                            focusedBorderColor = Color(0xFFF97316),
                            unfocusedBorderColor = Color(0xFF334155)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        OutlinedTextField(
                            value = litersValue.value,
                            onValueChange = { litersValue.value = it },
                            label = { Text("Fuel Liters", color = Color.Gray) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            colors = TextFieldDefaults.outlinedTextFieldColors(
                                textColor = Color.White,
                                focusedBorderColor = Color(0xFFF97316),
                                unfocusedBorderColor = Color(0xFF334155)
                            ),
                            modifier = Modifier.weight(1f).padding(end = 4.dp)
                        )

                        OutlinedTextField(
                            value = selectedProduct.value,
                            onValueChange = { selectedProduct.value = it },
                            label = { Text("Product", color = Color.Gray) },
                            colors = TextFieldDefaults.outlinedTextFieldColors(
                                textColor = Color.White,
                                focusedBorderColor = Color(0xFFF97316),
                                unfocusedBorderColor = Color(0xFF334155)
                            ),
                            modifier = Modifier.weight(1f).padding(start = 4.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = { authorizeOfflineTransaction() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                    ) {
                        Text(
                            text = "AUTHORIZE OFFLINE REFUELING",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }

            // Bottom Console Logger Status Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
                    .background(Color(0xFF0F172A), shape = RoundedCornerShape(12.dp))
                    .border(1.dp, Color(0xFF1E293B), shape = RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Column {
                    Text(
                        text = "CONSOLE OVERVIEW LOGS",
                        color = Color.Gray,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )
                    Text(
                        text = transactionStatusMessage.value ?: "Standing by. Tap an NFC/RFID fuel card on the back of the device to initialize authorization pipeline.",
                        color = if (isSuccessState.value) Color(0xFF34D399) else Color(0xFFF87171),
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 16.sp,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}
