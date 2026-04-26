module Security
  class Audit < ApplicationRecord
    belongs_to :user
    store_accessor :details, :action, :ip_address, :user_agent, :location, :device_type

    scope :failed_logins, -> { where(action: "failed_login") }
    scope :mfa_attempts, -> { where(action: ["mfa_success", "mfa_failure"]) }
    scope :admin_actions, -> { where(action: "admin_action") }

    after_create :log_to_security_monitoring

    private

    def log_to_security_monitoring
      Security::Monitor.track(
        event_type: "security_audit",
        user_id: user_id,
        action: action,
        ip: ip_address,
        device: device_type,
        location: location
      )
    end
  end
end
