package com.birthday.app;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Year;

@Slf4j
@Controller
public class BirthdayController {

    @GetMapping("/")
    public String birthdayPage(
            @RequestParam(defaultValue = "An") String name,
            @RequestParam(defaultValue = "Đào Đức") String from,
            Model model) {

        log.info("Birthday page requested for: {}", name);

        BirthdayMessage birthdayMessage = BirthdayMessage.builder()
                .recipientName(name)
                .senderName(from)
                .message("Chúc Mừng Sinh Nhật!")
                .subMessage("Chúc cậu luôn tràn đầy niềm vui, sức khỏe dồi dào và thành công rực rỡ trong năm mới này. Mỗi ngày trôi qua là một trang mới đầy ắp những điều tuyệt vời. 🌟")
                .year(String.valueOf(Year.now().getValue()))
                .build();

        model.addAttribute("birthday", birthdayMessage);
        return "birthday";
    }
}
