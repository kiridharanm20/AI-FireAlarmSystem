package com.firealarm.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.firealarm.entity.Alarm;
import com.firealarm.entity.Incident;
import com.firealarm.entity.WarningLog;
import com.firealarm.entity.User;
import com.firealarm.repository.UserRepository;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender sender;

    @Autowired
    private UserRepository userRepository;

    @Value("${spring.mail.username}")
    private String systemMailSenderUsername;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(systemMailSenderUsername);
        message.setTo(toEmail);
        message.setSubject("🔥 FireGuard AI - Email Verification OTP");
        message.setText(
            "Welcome to FireGuard AI Command Center!\n\n" +
            "Your One-Time Password (OTP) for user registration is:\n\n" +
            "👉  " + otp + "\n\n" +
            "This OTP is valid for 5 minutes. If you did not request this verification, please ignore this email.\n\n" +
            "Stay safe,\n" +
            "FireGuard AI System Team"
        );
        sender.send(message);
    }

    public void sendAlarmEmailToVerifiedUsers(Alarm alarm, Incident incident, WarningLog warningLog) {
        // Fetch all verified users from DB
        List<User> verifiedUsers;
        try {
            verifiedUsers = userRepository.findByVerifiedTrue();
        } catch (Exception e) {
            System.err.println("Failed to fetch verified users from database: " + e.getMessage());
            verifiedUsers = new java.util.ArrayList<>();
        }

        // Collect all verified recipient emails, ensuring kiridharanm20@gmail.com is always included
        java.util.Set<String> recipientEmails = new java.util.HashSet<>();
        recipientEmails.add("kiridharanm20@gmail.com");

        if (verifiedUsers != null) {
            for (User user : verifiedUsers) {
                String email = user.getEmail();
                if (email != null && !email.trim().isEmpty()) {
                    recipientEmails.add(email.trim().toLowerCase());
                }
            }
        }

        // Loop through each recipient and send alert email
        for (String email : recipientEmails) {
            try {
                sendIndividualEmail(email, "User/Administrator", alarm, incident, warningLog);
                System.out.println("Fire alert email sent successfully to recipient: " + email);
            } catch (Exception e) {
                System.err.println("Email sending failed for recipient " + email + ": " + e.getMessage());
            }
        }
    }

    private void sendIndividualEmail(String email, String username, Alarm alarm, Incident incident, WarningLog warningLog) throws Exception {
        MimeMessage mimeMessage = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setFrom(systemMailSenderUsername);
        helper.setTo(email);
        helper.setSubject("🔥 FIRE ALERT - AI-Based Smart Fire Alarm Monitoring System");

        String incidentId = incident != null && incident.getId() != null ? String.valueOf(incident.getId()) : "N/A";
        String location = alarm.getSensorLocation() != null ? alarm.getSensorLocation() : "Unknown Location";
        String severity = alarm.getSeverity() != null ? alarm.getSeverity() : "HIGH";
        String sensorIdStr = alarm.getSensorId() != null ? String.valueOf(alarm.getSensorId()) : "N/A";
        String status = alarm.getStatus() != null ? alarm.getStatus() : "ACTIVE";
        String incidentStatus = incident != null && incident.getIncidentStatus() != null ? incident.getIncidentStatus() : "OPEN";
        String date = incident != null && incident.getDate() != null ? incident.getDate() : LocalDate.now().toString();
        String time = LocalTime.now().toString().substring(0, 8);

        // Professional HTML Email Template
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\">"
                + "  <div style=\"background: #ef4444; padding: 20px; text-align: center; color: #ffffff;\">"
                + "    <h1 style=\"margin: 0; font-size: 24px; letter-spacing: 0.5px;\">🔥 FIRE ALERT</h1>"
                + "    <p style=\"margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;\">AI-Based Smart Fire Alarm Monitoring System</p>"
                + "  </div>"
                + "  <div style=\"padding: 24px; background: #ffffff; color: #1e293b;\">"
                + "    <p style=\"font-size: 15px; font-weight: bold; margin-bottom: 12px;\">Dear " + (username != null ? username : "User") + ",</p>"
                + "    <p style=\"font-size: 14px; margin-bottom: 20px; line-height: 1.5;\">A fire incident has been detected.</p>"
                + "    "
                + "    <h3 style=\"border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; color: #ef4444; font-size: 15px;\">Incident Details</h3>"
                + "    <table style=\"width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; line-height: 1.6;\">"
                + "      <tr>"
                + "        <td style=\"padding: 6px 0; font-weight: bold; width: 140px; color: #64748b;\">Incident ID:</td>"
                + "        <td style=\"padding: 6px 0; color: #1e293b;\">" + incidentId + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"padding: 6px 0; font-weight: bold; color: #64748b;\">Location:</td>"
                + "        <td style=\"padding: 6px 0; color: #1e293b;\">" + location + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"padding: 6px 0; font-weight: bold; color: #64748b;\">Severity:</td>"
                + "        <td style=\"padding: 6px 0; color: #ef4444; font-weight: bold;\">" + severity + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"padding: 6px 0; font-weight: bold; color: #64748b;\">Sensor ID:</td>"
                + "        <td style=\"padding: 6px 0; color: #1e293b;\">S-" + sensorIdStr + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"padding: 6px 0; font-weight: bold; color: #64748b;\">Alarm Status:</td>"
                + "        <td style=\"padding: 6px 0; color: #1e293b;\">" + status + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"padding: 6px 0; font-weight: bold; color: #64748b;\">Incident Status:</td>"
                + "        <td style=\"padding: 6px 0; color: #1e293b;\">" + incidentStatus + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"padding: 6px 0; font-weight: bold; color: #64748b;\">Date:</td>"
                + "        <td style=\"padding: 6px 0; color: #1e293b;\">" + date + "</td>"
                + "      </tr>"
                + "      <tr>"
                + "        <td style=\"padding: 6px 0; font-weight: bold; color: #64748b;\">Time:</td>"
                + "        <td style=\"padding: 6px 0; color: #1e293b;\">" + time + "</td>"
                + "      </tr>"
                + "    </table>"
                + "    "
                + "    <p style=\"margin-top: 24px; font-weight: bold; color: #ef4444; font-size: 14px;\">Please take immediate action and follow emergency procedures.</p>"
                + "    <div style=\"text-align: center; margin: 30px 0 20px 0;\">"
                + "      <a href=\"http://localhost:3000\" style=\"background: #ef4444; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;\">View Dashboard</a>"
                + "    </div>"
                + "    <p style=\"font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 15px;\">"
                + "      Regards,<br><strong>AI-Based Smart Fire Alarm Monitoring System</strong>"
                + "    </p>"
                + "  </div>"
                + "</div>";

        helper.setText(htmlContent, true);
        sender.send(mimeMessage);
    }
}