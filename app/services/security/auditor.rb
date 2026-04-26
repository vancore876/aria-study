module Security
  class Auditor
    def self.log_failed_login(user, ip, user_agent)
      create_audit(
        user: user,
        action: "failed_login",
        ip_address: ip,
        user_agent: user_agent,
        details: {
          location: geolocate(ip),
          device_type: detect_device(user_agent)
        }
      )
    end

    def self.log_mfa_attempt(user, success, ip, user_agent)
      action = success ? "mfa_success" : "mfa_failure"
      create_audit(
        user: user,
        action: action,
        ip_address: ip,
        user_agent: user_agent,
        details: {
          location: geolocate(ip),
          device_type: detect_device(user_agent)
        }
      )
    end

    def self.log_admin_action(user, action, ip, user_agent)
      create_audit(
        user: user,
        action: "admin_action",
        ip_address: ip,
        user_agent: user_agent,
        details: {
          location: geolocate(ip),
          device_type: detect_device(user_agent),
          performed_action: action
        }
      )
    end

    private

    def self.create_audit(params)
      Security::Audit.create!(
        user_id: params[:user],
        action: params[:action],
        ip_address: params[:ip_address],
        user_agent: params[:user_agent],
        details: params[:details]
      )
    end

    def self.geolocate(ip)
      # In production, integrate with IP geolocation API
      "Location data for #{ip}"
    end

    def self.detect_device(user_agent)
      if user_agent =~ /Mobile|Android/i
        "Mobile Device"
      elsif user_agent =~ /Tablet/i
        "Tablet"
      elsif user_agent =~ /Windows|Mac|Linux/i
        "Desktop"
      else
        "Unknown Device"
      end
    end
  end
end
