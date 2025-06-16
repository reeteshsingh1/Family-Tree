package com.familytree.model;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "persons")
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    private LocalDate dateOfDeath;
    private String gender;
    private String email;
    private String phoneNumber;
    private String address;
    private String gotra;

    @ManyToOne
    @JoinColumn(name = "father_id")
    private Person father;

    @ManyToOne
    @JoinColumn(name = "mother_id")
    private Person mother;

    @OneToMany(mappedBy = "father")
    private List<Person> childrenAsFather = new ArrayList<>();

    @OneToMany(mappedBy = "mother")
    private List<Person> childrenAsMother = new ArrayList<>();

    @OneToMany(mappedBy = "person1")
    private List<Marriage> marriagesAsPerson1 = new ArrayList<>();

    @OneToMany(mappedBy = "person2")
    private List<Marriage> marriagesAsPerson2 = new ArrayList<>();
} 