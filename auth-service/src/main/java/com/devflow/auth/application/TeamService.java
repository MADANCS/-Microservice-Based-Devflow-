package com.devflow.auth.application;

import com.devflow.auth.api.dto.TeamDTOs;
import com.devflow.auth.domain.model.Role;
import com.devflow.auth.domain.model.TeamMember;
import com.devflow.auth.domain.repository.TeamMemberRepository;
import com.devflow.common.exception.DevFlowException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TeamService {

    private final TeamMemberRepository teamMemberRepository;

    private static final String[] GRADIENTS = {
        "from-blue-600 to-indigo-600",
        "from-[#61dafb] to-blue-600",
        "from-purple-600 to-pink-600",
        "from-emerald-500 to-teal-600",
        "from-amber-500 to-orange-600"
    };

    public List<TeamDTOs.MemberResponse> getAllMembers(String searchQuery) {
        List<TeamMember> members;
        if (searchQuery != null && !searchQuery.isBlank()) {
            members = teamMemberRepository.searchMembers(searchQuery);
        } else {
            members = teamMemberRepository.findAll();
        }
        return members.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TeamDTOs.MemberResponse createMember(TeamDTOs.CreateMemberRequest req) {
        if (teamMemberRepository.existsByEmail(req.getEmail())) {
            throw DevFlowException.conflict("Team member with email already exists: " + req.getEmail());
        }

        Role memberRole;
        try {
            memberRole = Role.valueOf(req.getRole().toUpperCase());
        } catch (Exception e) {
            memberRole = Role.DEVELOPER;
        }

        String initial = req.getName().substring(0, Math.min(2, req.getName().length())).toUpperCase();
        int gradIndex = Math.abs(req.getName().hashCode()) % GRADIENTS.length;

        TeamMember member = TeamMember.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase())
                .role(memberRole)
                .status(req.getStatus() != null ? req.getStatus().toUpperCase() : "ONLINE")
                .avatar(initial)
                .avatarGradient(GRADIENTS[gradIndex])
                .joinedDate(LocalDate.now())
                .skills(req.getSkills() != null ? req.getSkills() : List.of("React", "Java"))
                .projectsAssigned(req.getProjectsAssigned() != null ? req.getProjectsAssigned() : List.of())
                .tasksAssigned(req.getTasksAssigned() != null ? req.getTasksAssigned() : List.of())
                .build();

        member = teamMemberRepository.save(member);
        log.info("Team member created: {}", member.getEmail());
        return toResponse(member);
    }

    public TeamDTOs.MemberResponse updateMember(String id, TeamDTOs.UpdateMemberRequest req) {
        TeamMember member = teamMemberRepository.findById(id)
                .orElseThrow(() -> DevFlowException.notFound("TeamMember", id));

        if (req.getName() != null) member.setName(req.getName());
        if (req.getRole() != null) {
            try {
                member.setRole(Role.valueOf(req.getRole().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (req.getStatus() != null) member.setStatus(req.getStatus().toUpperCase());
        if (req.getSkills() != null) member.setSkills(req.getSkills());
        if (req.getProjectsAssigned() != null) member.setProjectsAssigned(req.getProjectsAssigned());
        if (req.getTasksAssigned() != null) member.setTasksAssigned(req.getTasksAssigned());

        member = teamMemberRepository.save(member);
        return toResponse(member);
    }

    public void deleteMember(String id) {
        if (!teamMemberRepository.existsById(id)) {
            throw DevFlowException.notFound("TeamMember", id);
        }
        teamMemberRepository.deleteById(id);
        log.info("Team member deleted: {}", id);
    }

    private TeamDTOs.MemberResponse toResponse(TeamMember m) {
        TeamDTOs.MemberResponse resp = new TeamDTOs.MemberResponse();
        resp.setId(m.getId());
        resp.setName(m.getName());
        resp.setEmail(m.getEmail());
        resp.setRole(m.getRole().name());
        resp.setStatus(m.getStatus());
        resp.setAvatar(m.getAvatar());
        resp.setAvatarGradient(m.getAvatarGradient());
        resp.setJoinedDate(m.getJoinedDate() != null ? m.getJoinedDate().toString() : "");
        resp.setSkills(m.getSkills());
        resp.setProjectsAssigned(m.getProjectsAssigned());
        resp.setTasksAssigned(m.getTasksAssigned());
        return resp;
    }
}
