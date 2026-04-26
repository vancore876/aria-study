module Analytics
  class Tracker
    def self.track_signup(user)
      Segment.track(
        user_id: user.id,
        event: "User Signup",
        properties: {
          email: user.email,
          created_at: user.created_at,
          ip_address: request.remote_ip,
          device_type: device_type,
          referral_source: user.referral_source
        }
      )
    end

    def self.track_mfa_enabled(user)
      Segment.track(
        user_id: user.id,
        event: "MFA Enabled",
        properties: {
          mfa_method: "TOTP",
          timestamp: Time.current
        }
      )
    end

    def self.track_payment_success(user, amount)
      Segment.track(
        user_id: user.id,
        event: "Payment Success",
        properties: {
          amount: amount,
          currency: "USD",
          subscription_status: user.subscription_status,
          payment_method: "card"
        }
      )
    end

    private

    def self.device_type
      if request.user_agent =~ /iPhone|iPad|iPod/i
        "iOS"
      elsif request.user_agent =~ /Android/i
        "Android"
      elsif request.user_agent =~ /Windows/i
        "Windows"
      elsif request.user_agent =~ /Mac/i
        "Mac"
      else
        "Other"
      end
    end
  end
end
