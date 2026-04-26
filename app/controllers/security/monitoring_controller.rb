module Security
  class MonitoringController < ApplicationController
    def dashboard
      @recent_events = Security::Monitor
                     .where(user_id: current_user.id)
                     .order(created_at: :desc)
                     .limit(20)
    end

    def stats
      stats = {
        failed_logins: Security::Monitor
                        .where(event_type: "failed_login")
                        .where("created_at > ?", 1.hour.ago)
                        .count,
        mfa_attempts: Security::Monitor
                       .where(event_type: "mfa_event")
                       .where("created_at > ?", 1.hour.ago)
                       .count
      }
      render json: stats
    end
  end
end
