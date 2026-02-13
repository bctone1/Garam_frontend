import React, { useState, useEffect } from "react";
import "../user_styles/secureNumberPad.css";

const shuffleDigits = () => {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const formatBusinessNumber = (raw) => {
    const d = raw.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
};

export default function SecureNumberPad({ visible, onConfirm, onCancel }) {
    const [digits, setDigits] = useState("");
    const [shuffledKeys, setShuffledKeys] = useState(shuffleDigits());

    useEffect(() => {
        if (visible) {
            setDigits("");
            setShuffledKeys(shuffleDigits());
        }
    }, [visible]);

    const handleDigitPress = (digit) => {
        if (digits.length < 10) {
            setDigits((prev) => prev + String(digit));
        }
    };

    const handleBackspace = () => {
        setDigits((prev) => prev.slice(0, -1));
    };

    const handleConfirm = () => {
        if (digits.length === 10) {
            onConfirm(digits);
        }
    };

    if (!visible) return null;

    const digitBoxes = [];
    const separatorPositions = [3, 5];
    for (let i = 0; i < 10; i++) {
        if (separatorPositions.includes(i)) {
            digitBoxes.push(
                <span key={`sep-${i}`} className="snp-separator">-</span>
            );
        }
        digitBoxes.push(
            <div
                key={`digit-${i}`}
                className={`snp-digit-box ${i < digits.length ? "filled" : ""}`}
            >
                <span className="snp-digit-text">
                    {i < digits.length ? digits[i] : ""}
                </span>
            </div>
        );
    }

    return (
        <div className="snp-overlay">
            <div className="snp-container">
                <div className="snp-header">
                    <i className="fas fa-lock snp-lock-icon"></i>
                    <div className="snp-title">사업자번호 입력</div>
                    <div className="snp-subtitle">보안 키패드</div>
                </div>

                <div className="snp-display">
                    <div className="snp-digit-row">{digitBoxes}</div>
                    <div className="snp-format-hint">
                        {digits.length > 0 ? formatBusinessNumber(digits) : "XXX-XX-XXXXX"}
                    </div>
                </div>

                <div className="snp-keypad">
                    {shuffledKeys.slice(0, 9).map((digit, index) => (
                        <button
                            key={`key-${index}`}
                            className="snp-key"
                            onClick={() => handleDigitPress(digit)}
                            type="button"
                        >
                            {digit}
                        </button>
                    ))}

                    <button
                        className="snp-key snp-cancel-key"
                        onClick={onCancel}
                        type="button"
                    >
                        취소
                    </button>

                    <button
                        className="snp-key"
                        onClick={() => handleDigitPress(shuffledKeys[9])}
                        type="button"
                    >
                        {shuffledKeys[9]}
                    </button>

                    <button
                        className="snp-key snp-backspace-key"
                        onClick={handleBackspace}
                        type="button"
                    >
                        <i className="fas fa-backspace"></i>
                    </button>
                </div>

                <button
                    className={`snp-confirm ${digits.length === 10 ? "active" : ""}`}
                    onClick={handleConfirm}
                    disabled={digits.length !== 10}
                    type="button"
                >
                    확인 ({digits.length}/10)
                </button>
            </div>
        </div>
    );
}
