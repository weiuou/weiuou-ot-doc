package xyz.weiuou.ot_doc;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/doc")
@CrossOrigin(origins = "*")
public class DocRestController {
    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String DOC_KEY = "otdoc:content";

    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getDoc() {
        String content = redisTemplate.opsForValue().get(DOC_KEY);
        if (content == null) content = "**Hello Markdown!**";
        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_PLAIN)
            .body(content);
    }

    @PostMapping(consumes = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<Void> saveDoc(@RequestBody String content) {
        redisTemplate.opsForValue().set(DOC_KEY, content);
        return ResponseEntity.ok().build();
    }
}
