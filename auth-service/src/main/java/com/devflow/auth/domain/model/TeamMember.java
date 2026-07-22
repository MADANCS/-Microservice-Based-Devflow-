package com.devflow.auth.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "team_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String status; // ONLINE, AWAY, OFFLINE

    private String avatar;

    private String avatarGradient;

    private LocalDate joinedDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "member_skills", joinColumns = @JoinColumn(name = "member_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "member_projects", joinColumns = @JoinColumn(name = "member_id"))
    @Column(name = "project_id")
    @Builder.Default
    private List<String> projectsAssigned = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "member_tasks", joinColumns = @JoinColumn(name = "member_id"))
    @Column(name = "task_id")
    @Builder.Default
    private List<String> tasksAssigned = new ArrayList<>();
}
