<?php
/**
 * Group Model
 */
class Group {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Create new group
     */
    public function create($name, $ownerId) {
        $sql = "INSERT INTO `groups` (name, owner_id) VALUES (?, ?)";
        $this->db->execute($sql, [$name, $ownerId]);
        return $this->db->lastInsertId();
    }

    /**
     * Get all groups owned by user
     */
    public function getOwnedByUser($userId) {
        $sql = "SELECT g.*, COUNT(p.id) as person_count
                FROM `groups` g
                LEFT JOIN people p ON g.id = p.group_id
                WHERE g.owner_id = ?
                GROUP BY g.id
                ORDER BY g.updated_at DESC";
        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Get all groups shared with user
     */
    public function getSharedWithUser($userId) {
        $sql = "SELECT g.*, gs.permission, u.name as owner_name, COUNT(p.id) as person_count
                FROM `groups` g
                INNER JOIN group_shares gs ON g.id = gs.group_id
                INNER JOIN users u ON g.owner_id = u.id
                LEFT JOIN people p ON g.id = p.group_id
                WHERE gs.shared_with_user_id = ?
                GROUP BY g.id, gs.permission, u.name
                ORDER BY gs.shared_at DESC";
        return $this->db->fetchAll($sql, [$userId]);
    }

    /**
     * Get group by ID
     */
    public function findById($id) {
        $sql = "SELECT * FROM `groups` WHERE id = ?";
        return $this->db->fetchOne($sql, [$id]);
    }

    /**
     * Update group
     */
    public function update($id, $name) {
        $sql = "UPDATE `groups` SET name = ?, updated_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [$name, $id]);
    }

    /**
     * Delete group
     */
    public function delete($id) {
        $sql = "DELETE FROM `groups` WHERE id = ?";
        return $this->db->execute($sql, [$id]);
    }

    /**
     * Check if user owns group
     */
    public function isOwner($groupId, $userId) {
        $sql = "SELECT id FROM `groups` WHERE id = ? AND owner_id = ?";
        $result = $this->db->fetchOne($sql, [$groupId, $userId]);
        return $result !== false;
    }

    /**
     * Check if user has access to group (owner or shared)
     */
    public function hasAccess($groupId, $userId) {
        // Check if owner
        if ($this->isOwner($groupId, $userId)) {
            return true;
        }

        // Check if shared
        $sql = "SELECT id FROM group_shares WHERE group_id = ? AND shared_with_user_id = ?";
        $result = $this->db->fetchOne($sql, [$groupId, $userId]);
        return $result !== false;
    }

    /**
     * Get user's permission for group
     */
    public function getPermission($groupId, $userId) {
        // Owners have edit permission
        if ($this->isOwner($groupId, $userId)) {
            return 'edit';
        }

        // Check shared permission
        $sql = "SELECT permission FROM group_shares WHERE group_id = ? AND shared_with_user_id = ?";
        $result = $this->db->fetchOne($sql, [$groupId, $userId]);

        return $result ? $result['permission'] : null;
    }

    /**
     * Share group with user
     */
    public function share($groupId, $sharedWithUserId, $sharedByUserId, $permission = 'view') {
        $sql = "INSERT INTO group_shares (group_id, shared_with_user_id, shared_by_user_id, permission)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE permission = ?";
        return $this->db->execute($sql, [$groupId, $sharedWithUserId, $sharedByUserId, $permission, $permission]);
    }

    /**
     * Unshare group
     */
    public function unshare($groupId, $sharedWithUserId) {
        $sql = "DELETE FROM group_shares WHERE group_id = ? AND shared_with_user_id = ?";
        return $this->db->execute($sql, [$groupId, $sharedWithUserId]);
    }

    /**
     * Get all shares for a group
     */
    public function getShares($groupId) {
        $sql = "SELECT gs.*, u.name, u.email
                FROM group_shares gs
                INNER JOIN users u ON gs.shared_with_user_id = u.id
                WHERE gs.group_id = ?";
        return $this->db->fetchAll($sql, [$groupId]);
    }
}
