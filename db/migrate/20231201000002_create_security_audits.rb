class CreateSecurityAudits < ActiveRecord::Migration[7.0]
  def change
    create_table :security_audits do |t|
      t.references :user, null: false, foreign_key: true
      t.string :action, null: false
      t.string :ip_address
      t.string :user_agent
      t.jsonb :details, default: {}
      t.string :location
      t.string :device_type
      t.timestamps
    end

    add_index :security_audits, :action
    add_index :security_audits, :created_at
    add_index :security_audits, :user_id
  end
end
