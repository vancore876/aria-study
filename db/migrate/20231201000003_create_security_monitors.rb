class CreateSecurityMonitors < ActiveRecord::Migration[7.0]
  def change
    create_table :security_monitors do |t|
      t.references :user, null: false, foreign_key: true
      t.string :event_type, null: false
      t.string :ip, null: false
      t.string :device
      t.string :location
      t.timestamps
    end

    add_index :security_monitors, :event_type
    add_index :security_monitors, :created_at
    add_index :security_monitors, :user_id
  end
end
