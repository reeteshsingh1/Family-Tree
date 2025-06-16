package com.familytree.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonRequest {
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private LocalDate dateOfDeath;
    private String gender;
    private String email;
    private String phoneNumber;
    private String address;
    private String gotra;
    private Long fatherId;
    private Long motherId;
} 