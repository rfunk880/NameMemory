<?php
/**
 * Person Model
 */
class Person {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Create new person
     */
    public function create($data) {
        $sql = "INSERT INTO people (
                    group_id, first_name, middle_name, last_name, suffix,
                    nickname, description, notes, photo_url, thumbnail_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $params = [
            $data['group_id'],
            $data['first_name'],
            $data['middle_name'] ?? null,
            $data['last_name'] ?? null,
            $data['suffix'] ?? null,
            $data['nickname'] ?? null,
            $data['description'] ?? null,
            $data['notes'] ?? null,
            $data['photo_url'] ?? null,
            $data['thumbnail_url'] ?? null
        ];

        $this->db->execute($sql, $params);
        return $this->db->lastInsertId();
    }

    /**
     * Get all people in a group
     */
    public function getByGroup($groupId) {
        $sql = "SELECT * FROM people WHERE group_id = ? ORDER BY first_name, last_name";
        return $this->db->fetchAll($sql, [$groupId]);
    }

    /**
     * Get person by ID
     */
    public function findById($id) {
        $sql = "SELECT * FROM people WHERE id = ?";
        return $this->db->fetchOne($sql, [$id]);
    }

    /**
     * Update person
     */
    public function update($id, $data) {
        $sql = "UPDATE people SET
                first_name = ?,
                middle_name = ?,
                last_name = ?,
                suffix = ?,
                nickname = ?,
                description = ?,
                notes = ?,
                photo_url = ?,
                thumbnail_url = ?,
                updated_at = NOW()
                WHERE id = ?";

        $params = [
            $data['first_name'],
            $data['middle_name'] ?? null,
            $data['last_name'] ?? null,
            $data['suffix'] ?? null,
            $data['nickname'] ?? null,
            $data['description'] ?? null,
            $data['notes'] ?? null,
            $data['photo_url'] ?? null,
            $data['thumbnail_url'] ?? null,
            $id
        ];

        return $this->db->execute($sql, $params);
    }

    /**
     * Delete person
     */
    public function delete($id) {
        // Get person to delete associated images
        $person = $this->findById($id);

        if ($person && $person['photo_url']) {
            ImageOptimizer::deleteImages($person['photo_url'], $person['thumbnail_url']);
        }

        $sql = "DELETE FROM people WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }

    /**
     * Get group ID for a person
     */
    public function getGroupId($personId) {
        $sql = "SELECT group_id FROM people WHERE id = ?";
        $result = $this->db->fetchOne($sql, [$personId]);
        return $result ? $result['group_id'] : null;
    }

    /**
     * Count people in group
     */
    public function countByGroup($groupId) {
        $sql = "SELECT COUNT(*) as count FROM people WHERE group_id = ?";
        $result = $this->db->fetchOne($sql, [$groupId]);
        return $result ? $result['count'] : 0;
    }
}
