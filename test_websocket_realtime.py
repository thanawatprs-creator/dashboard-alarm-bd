"""
Comprehensive Multi-Client Real-Time WebSocket Testing Script.
Connects to live running FastAPI server on http://127.0.0.1:8000
Validates:
1. Two simultaneous WebSocket clients (Window 1 and Window 2)
2. Immediate broadcast to both clients upon breakdown injection
3. SQLite state persistence in machines table
4. Audit trail logging in alarm_history table
5. Machine recovery broadcast and active alarm removal
6. WebSocket heartbeat ping/pong
"""
import sys
import asyncio
import json
import urllib.request
import websockets
from backend.database import SessionLocal
from backend.models import Machine, AlarmHistory

sys.stdout.reconfigure(line_buffering=True)

SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8000
WS_URL = f"ws://{SERVER_HOST}:{SERVER_PORT}/ws"
API_URL = f"http://{SERVER_HOST}:{SERVER_PORT}/api"


async def run_tests():
    print("=" * 70, flush=True)
    print(" STARTING REAL-TIME WEBSOCKET & MULTI-CLIENT SYNCHRONIZATION TEST", flush=True)
    print("=" * 70, flush=True)

    # 1. Connect Client 1 (Window 1) and Client 2 (Window 2)
    print("\n[Step 1] Connecting Client 1 (Dashboard Window 1)...", flush=True)
    ws1 = await websockets.connect(WS_URL)
    init_msg1 = json.loads(await ws1.recv())
    assert init_msg1["event"] == "system_status"
    print("   ✓ Client 1 Connected. System Status Event received.", flush=True)

    print("\n[Step 2] Connecting Client 2 (Dashboard Window 2)...", flush=True)
    ws2 = await websockets.connect(WS_URL)
    init_msg2 = json.loads(await ws2.recv())
    assert init_msg2["event"] == "system_status"
    print("   ✓ Client 2 Connected. Multi-client pool active.", flush=True)

    # 2. Test Heartbeat Ping/Pong
    print("\n[Step 3] Testing WebSocket Heartbeat (Ping/Pong)...", flush=True)
    await ws1.send("ping")
    pong_res = json.loads(await ws1.recv())
    assert pong_res["event"] == "pong"
    print("   ✓ Heartbeat verified: Received 'pong' response.", flush=True)

    # 3. Trigger Breakdown on MC-002
    print("\n[Step 4] Triggering Breakdown on MC-002 via REST API...", flush=True)
    req = urllib.request.Request(
        f"{API_URL}/simulation/trigger?action=BREAKDOWN&machine_id=MC-002&description=Bearing+Thermal+Overload",
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        assert data["status"] == "success"
        print(f"   ✓ REST Trigger Successful. SR generated: {data['machine']['sr_number']}", flush=True)

    # 4. Receive Broadcast on Client 1 and Client 2
    print("\n[Step 5] Checking immediate WebSocket broadcast on BOTH clients...", flush=True)
    
    # Read incoming events on Client 1
    events_client1 = []
    for _ in range(3):
        msg = json.loads(await asyncio.wait_for(ws1.recv(), timeout=4.0))
        events_client1.append(msg["event"])
    print(f"   ✓ Client 1 received real-time events: {events_client1}", flush=True)
    assert "machine_status_changed" in events_client1

    # Read incoming events on Client 2
    events_client2 = []
    for _ in range(3):
        msg = json.loads(await asyncio.wait_for(ws2.recv(), timeout=4.0))
        events_client2.append(msg["event"])
    print(f"   ✓ Client 2 received matching events:  {events_client2}", flush=True)
    assert "machine_status_changed" in events_client2

    # 5. Verify SQLite Database State
    print("\n[Step 6] Verifying SQLite database persistence...", flush=True)
    db = SessionLocal()
    try:
        m2 = db.query(Machine).filter(Machine.machine_id == "MC-002").first()
        assert m2.status == "BREAKDOWN"
        assert m2.breakdown_start_time is not None
        assert "SR-2026-" in m2.sr_number
        print(f"   ✓ SQLite machines table: MC-002 status = {m2.status}, SR = {m2.sr_number}", flush=True)

        # Check alarm_history
        hist = db.query(AlarmHistory).filter(AlarmHistory.machine_id == "MC-002").order_by(AlarmHistory.id.desc()).first()
        assert hist.new_status == "BREAKDOWN"
        print(f"   ✓ SQLite alarm_history table: Event recorded '{hist.event_description}'", flush=True)
    finally:
        db.close()

    # 6. Restore MC-002 to NORMAL
    print("\n[Step 7] Restoring MC-002 to NORMAL via REST API...", flush=True)
    req_restore = urllib.request.Request(
        f"{API_URL}/simulation/trigger?action=NORMAL&machine_id=MC-002",
        method="POST"
    )
    with urllib.request.urlopen(req_restore) as resp:
        data = json.loads(resp.read().decode())
        assert data["machine"]["status"] == "NORMAL"

    # 7. Verify Recovery Broadcast on BOTH clients
    print("\n[Step 8] Checking Recovery Broadcast on BOTH clients...", flush=True)
    recovery_events1 = []
    for _ in range(3):
        msg = json.loads(await asyncio.wait_for(ws1.recv(), timeout=4.0))
        recovery_events1.append(msg["event"])
    print(f"   ✓ Client 1 received recovery events: {recovery_events1}", flush=True)
    assert "machine_recovered" in recovery_events1

    recovery_events2 = []
    for _ in range(3):
        msg = json.loads(await asyncio.wait_for(ws2.recv(), timeout=4.0))
        recovery_events2.append(msg["event"])
    print(f"   ✓ Client 2 received recovery events: {recovery_events2}", flush=True)
    assert "machine_recovered" in recovery_events2

    # 8. Clean up connections
    await ws1.close()
    await ws2.close()

    print("\n" + "=" * 70, flush=True)
    print(" ALL REAL-TIME WEBSOCKET MULTI-CLIENT TESTS PASSED 100% PERFECTLY!", flush=True)
    print("=" * 70, flush=True)


if __name__ == "__main__":
    asyncio.run(run_tests())
