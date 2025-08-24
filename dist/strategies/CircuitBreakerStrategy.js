"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCircuitBreakerStrategy = exports.CircuitState = void 0;
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class DefaultCircuitBreakerStrategy {
    constructor(config = {}) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.lastStateChangeTime = Date.now();
        this.config = {
            failureThreshold: 5,
            recoveryTimeout: 60000, // 60 saniye
            monitoringPeriod: 60000, // 60 saniye
            expectedErrors: [500, 502, 503, 504],
            ...config
        };
    }
    isOpen() {
        this.updateState();
        return this.state === CircuitState.OPEN;
    }
    canExecute() {
        this.updateState();
        return this.state !== CircuitState.OPEN;
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.transitionTo(CircuitState.CLOSED);
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.config.failureThreshold) {
            this.transitionTo(CircuitState.OPEN);
        }
    }
    updateState() {
        const now = Date.now();
        if (this.state === CircuitState.OPEN) {
            if (now - this.lastStateChangeTime >= this.config.recoveryTimeout) {
                this.transitionTo(CircuitState.HALF_OPEN);
            }
        }
    }
    transitionTo(newState) {
        this.state = newState;
        this.lastStateChangeTime = Date.now();
    }
    getState() {
        this.updateState(); // State'i güncelle
        return this.state;
    }
    getFailureCount() {
        return this.failureCount;
    }
    getConfig() {
        return { ...this.config };
    }
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.lastStateChangeTime = Date.now();
    }
}
exports.DefaultCircuitBreakerStrategy = DefaultCircuitBreakerStrategy;
//# sourceMappingURL=CircuitBreakerStrategy.js.map