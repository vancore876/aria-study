class CreateAnalyticsEvents < ActiveRecord::Migration[7.0]
  def change
    create_table :analytics_events do |t|
      t.references :user, null: false, foreign_key: true
      t.string :event_type, null: false
      t.jsonb :properties, default: {}
      t.string :ip_address
      t.string :user_agent
      t.timestamps
    end

    add_index :analytics_events, :event_type
    add_index :analytics_events, :created_at
  end
end
