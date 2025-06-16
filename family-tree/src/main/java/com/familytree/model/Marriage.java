package com.familytree.model;

import javax.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Entity
@Table(name = "marriages", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"person1_id", "person2_id"})
})
public class Marriage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "person1_id", nullable = false)
    private Person person1;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "person2_id", nullable = false)
    private Person person2;

    @Column(nullable = false)
    private LocalDate marriageDate;

    private LocalDate divorceDate;
    private String status; // "ACTIVE", "DIVORCED", "WIDOWED"
} 