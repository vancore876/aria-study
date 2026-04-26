class User < ApplicationRecord
  has_secure_password

  # Multi-Factor Authentication
  before_create :generate_totp_secret
  validates :totp_secret, presence: true

  def totp_secret
    @totp_secret ||= ROTP::Base32.random
  end

  def totp_provisioning_uri
    ROTP::TOTP.new(totp_secret).provisioning_uri("#{email}", "MyApp")
  end

  def verify_totp(code)
    ROTP::TOTP.new(totp_secret).verify(code, 1)
  end

  private

  def generate_totp_secret
    self.totp_secret = ROTP::Base32.random
  end
end
