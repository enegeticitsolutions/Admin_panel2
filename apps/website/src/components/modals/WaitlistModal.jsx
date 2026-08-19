import React, { useState } from "react";
import waitlistService from "../../services/WaitlistService";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

/**
 * WaitlistModal Component - Modal registration dialog for joining waitlist
 */
const WaitlistModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pinCode: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      setSubmitError("Please enter a valid mobile number.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await waitlistService.submitWaitlist(formData);
      setFormData({ name: "", phone: "", pinCode: "", email: "" });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Waitlist registration form">
      <div className="modal-card">
        <button onClick={onClose} className="modal-close" aria-label="Close form">
          x
        </button>

        <h2>Share Your Details</h2>
        <p>Help us understand you better so we can serve you right.</p>

        {showSuccess && (
          <div className="form-message form-message--success">
            Form submitted successfully. We'll get back to you soon.
          </div>
        )}

        {submitError && (
          <div className="form-message form-message--error">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="waitlist-form" aria-label="Waitlist registration">
          <input
            id="form-name"
            type="text"
            name="name"
            placeholder="Full Name"
            required
            aria-label="Full Name"
            autoComplete="name"
            value={formData.name}
            onChange={handleInputChange}
          />

          <PhoneInput
            id="form-phone"
            name="phone"
            placeholder="Mobile Number"
            defaultCountry="IN"
            international
            required
            aria-label="Mobile Number"
            autoComplete="tel"
            value={formData.phone}
            onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
            className="phone-input-wrapper"
          />

          <input
            id="form-pincode"
            type="text"
            name="pinCode"
            placeholder="Pin Code"
            required
            aria-label="Pin Code"
            autoComplete="postal-code"
            value={formData.pinCode}
            onChange={handleInputChange}
            pattern="[0-9]{6}"
            maxLength={6}
            title="Enter a valid 6-digit pin code"
          />

          <input
            id="form-email"
            type="email"
            name="email"
            placeholder="Email Address"
            required
            aria-label="Email Address"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
          />

          <button type="submit" disabled={isSubmitting || showSuccess}>
            {isSubmitting ? "Submitting..." : showSuccess ? "Done" : "Submit Details"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WaitlistModal;
