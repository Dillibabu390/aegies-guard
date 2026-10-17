"""
AegisGuard AI Resilience & Circuit Breaker Engine
==================================================
Protects real-time payment authorization from API latency, rate limits (429 Quota Exhaustion),
and external network timeouts.

Guarantees sub-second deterministic fallback when external LLM endpoints are unavailable.
"""

import time
import threading
from typing import Optional

class GeminiCircuitBreaker:
    """
    Thread-safe Circuit Breaker for Google Gemini LLM calls.
    - CLOSED: Normal operation, calls are allowed through.
    - OPEN: Tripped after 429 quota exhaustion or repeated timeouts; immediately invokes fallback.
    - HALF_OPEN: Trial period to test if quota has reset.
    """
    def __init__(self, failure_threshold: int = 2, recovery_timeout_seconds: float = 120.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout_seconds
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.state = "CLOSED"  # "CLOSED", "OPEN", "HALF_OPEN"
        self.last_error_message = ""
        self._lock = threading.Lock()

    def can_execute(self) -> bool:
        with self._lock:
            now = time.time()
            if self.state == "OPEN":
                if now - self.last_failure_time > self.recovery_timeout:
                    self.state = "HALF_OPEN"
                    return True
                return False
            return True

    def record_success(self):
        with self._lock:
            self.failure_count = 0
            self.state = "CLOSED"
            self.last_error_message = ""

    def record_failure(self, error: Exception | str):
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            err_str = str(error)
            self.last_error_message = err_str

            # Instant trip on 429 quota exhaustion or resource exhaustion
            if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str or "Quota exceeded" in err_str:
                self.state = "OPEN"
                # Keep open longer for quota resets
                self.recovery_timeout = 300.0
            elif self.failure_count >= self.failure_threshold:
                self.state = "OPEN"

    def reset(self):
        with self._lock:
            self.failure_count = 0
            self.state = "CLOSED"
            self.last_error_message = ""

    def get_status(self) -> dict:
        with self._lock:
            now = time.time()
            remaining_cooldown = max(0, round(self.recovery_timeout - (now - self.last_failure_time))) if self.state == "OPEN" else 0
            return {
                "state": self.state,
                "isAvailable": self.state != "OPEN",
                "failureCount": self.failure_count,
                "remainingCooldownSeconds": remaining_cooldown,
                "lastError": self.last_error_message[:150] if self.last_error_message else None
            }

# Singleton instance
gemini_circuit_breaker = GeminiCircuitBreaker()
