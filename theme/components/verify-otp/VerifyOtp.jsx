import React, { useEffect, useState } from "react";
import styles from "./verify-otp.less";
import CloseIcon from "../../assets/images/close.svg";
import MessageCard from "../message-card/MessageCard";

const VerifyOtp = ({
  onOpen,
  onClose,
  onVerify,
  phoneNumber,
  email,
  onResend,
  isResendDisabled,
  otpResponseError,
  removeErrorMessage,
  coolDownSecondsRef,
  handleResendDisable,
  showOTPpopup,
}) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [cooldown, setCooldown] = useState(coolDownSecondsRef?.current || 55);
  const [inlineError, setInlineError] = useState(""); // New state for inline errors
  
  useEffect(() => {
    let timer;
    if (showOTPpopup && isResendDisabled && cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (cooldown === 0) {
      handleResendDisable();
      setCooldown(coolDownSecondsRef?.current || 55);
    }
    return () => clearTimeout(timer);
  }, [showOTPpopup, cooldown, isResendDisabled]);

  useEffect(() => {
    if (typeof onOpen === "function") {
      onOpen();
    }
  }, []);

  // Clear inline error when otpResponseError changes or is cleared
  useEffect(() => {
    if (!otpResponseError || otpResponseError.length === 0) {
      setInlineError("");
    }
  }, [otpResponseError]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; 

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Clear inline error when user starts typing
    if (inlineError) {
      setInlineError("");
    }

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      handleVerify();
      return;
    }

    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join("");
    if (otpCode.length === 4) {
      setInlineError(""); // Clear any existing inline error
      onVerify(otpCode);
    } else {
      // Replace alert with inline error
      setInlineError("Please enter a valid 4-digit OTP");
    }
  };

  // Determine which error to show (prioritize inline error over response error)
  const displayError = inlineError || otpResponseError;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.verifyHeader}>
          <div>Verify to Edit</div>
          <button className={styles.closeIconCont} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.otpContainer}>
          <MessageCard
            type="info"
            message="Verify the OTP to edit delivery details"
            secondaryMessage={
              <>
                Enter and verify the OTP sent to <br /> +91{phoneNumber}
                {email && email.trim() !== "" && (
                  <>
                    {" "}
                    and <br /> {email}
                  </>
                )}
              </>
            }
            showReason={false}
            customStyles={{
              messageContent: { padding: "0px 0px 0px 16px" },
              infoIconContainer: { paddingTop: "0px" },
            }}
          />
          <div className={styles.otpInputContainer}>
            <div className={styles.enterOtpText}>Enter OTP</div>
            <div className={styles.maincontainer}>
              <div className={styles.inputContainer}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`${styles.otpInput} ${styles.errorStyles}`}
                    style={
                      displayError?.length > 0
                        ? { borderColor: "#D93131" }
                        : {}
                    }
                  />
                ))}
              </div>
              {displayError?.length > 0 && (
                <div className={styles.otpResponseError}>
                  {displayError}
                </div>
              )}
            </div>
            <div
              className={`${styles.resendOtp} ${isResendDisabled ? styles.disabled : ""}`}
              onClick={() => {
                if (!isResendDisabled && typeof onResend === "function") {
                  onResend();
                }
              }}
            >
              {isResendDisabled ? (
                <span className={styles.resendTimerTextStyles}>
                  {`Resend OTP in ${cooldown} Sec`}
                </span>
              ) : (
                <span
                  onClick={() => {
                    setOtp((prev) => ["", "", "", ""]);
                    setInlineError(""); // Clear inline error when resending
                    removeErrorMessage();
                  }}
                  className={styles.resendOtpTextStyles}
                >
                  RESEND OTP
                </span>
              )}
            </div>
          </div>

          <button className={styles.verifyBtn} onClick={handleVerify}>
            VERIFY
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;