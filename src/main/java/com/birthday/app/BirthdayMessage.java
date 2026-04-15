package com.birthday.app;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BirthdayMessage {
    private String recipientName;
    private String senderName;
    private String message;
    private String subMessage;
    private String year;
}
