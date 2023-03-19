package com.capstone.timepay.service.admin.dto;

import com.capstone.timepay.domain.admin.Admin;
import com.capstone.timepay.service.admin.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class AdminServiceTest {

    @Autowired
    AdminService adminService;

    @Test
    void getList() {
        //given
        Admin admin = Admin.builder()
                .adminName("admin1")
                .password("1234")
                .authority("super")
                .name("jun")
                .email("test@asdf.com")
                .phone("123-4567-890")
                .build();

        adminService.create(admin);
        //when
        List<Admin> adminList = adminService.getList();

        //then
        System.out.println(adminList);
    }

    @Test
    void getAdmin() {
    }
}