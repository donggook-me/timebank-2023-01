package com.capstone.timepay.service.board.service;

import com.capstone.timepay.domain.freeBoard.FreeBoard;
import com.capstone.timepay.domain.freeBoard.FreeBoardRepository;
import com.capstone.timepay.domain.freeBoardComment.FreeBoardComment;
import com.capstone.timepay.domain.freeBoardComment.FreeBoardCommentRepository;
import com.capstone.timepay.domain.user.User;
import com.capstone.timepay.service.board.dto.FreeBoardCommentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class FreeBoardCommentService {
    private final FreeBoardCommentRepository freeBoardCommentRepository;
    private final FreeBoardRepository freeBoardRepository;

    // 댓글 작성
    @Transactional
    public FreeBoardCommentDTO writeComment(Long boardId, FreeBoardCommentDTO freeBoardCommentDTO, Long uid)
    {
        FreeBoardComment freeBoardComment = new FreeBoardComment();
        freeBoardComment.setContent(freeBoardCommentDTO.getContent());
        freeBoardComment.setCreatedAt(LocalDateTime.now());

        FreeBoard freeBoard = freeBoardRepository.findById(boardId).orElseThrow(() -> {
            return new IllegalArgumentException("게시판을 찾을 수 없습니다.");
        });

        freeBoardComment.setUid(uid);
        freeBoardComment.setFreeBoard(freeBoard);
        freeBoardCommentRepository.save(freeBoardComment);

        return FreeBoardCommentDTO.toFreeBoardCommentDTO(freeBoardComment);
    }

    // 현재 글의 전체 댓글 불러오기
    @Transactional(readOnly = true)
    public List<FreeBoardCommentDTO> getComments(Long boardId)
    {
        List<FreeBoardComment> comments = freeBoardCommentRepository.findAllByFreeBoard(freeBoardRepository.findById(boardId).get());
        List<FreeBoardCommentDTO> commentDTOS = new ArrayList<>();

        comments.forEach(s -> commentDTOS.add(FreeBoardCommentDTO.toFreeBoardCommentDTO(s)));
        return commentDTOS;
    }

    // 댓글 삭제
    @Transactional
    public String deleteComment(Long commentId)
    {
        FreeBoardComment freeBoardComment = freeBoardCommentRepository.findById(commentId).orElseThrow(() -> {
            return new IllegalArgumentException("댓글을 찾을 수 없습니다");
        });
        freeBoardCommentRepository.deleteById(commentId);
        return "삭제 완료";
    }
}
