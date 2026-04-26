module Security
  class Monitor < ApplicationRecord
    belongs_to :user
    validates :event_type, presence: true
    validates :ip, presence: true

    scope :recent_events, -> { where("created_at > ?", 1.hour.ago) }
    scope :failed_attempts, -> { where(event_type: "failed_login") }
    scope :mfa_events, -> { where(event_type: "mfa_event") }

    after_create_commit :broadcast_to_dashboard

    private

    def broadcast_to_dashboard
      ActionCable.server.broadcast(
        "security_dashboard_#{user_id}",
        {
          event_type: event_type,
          ip: ip,
          device: device,
          location: location,
          timestamp: created_at
        }
      )
    end
  end
end
