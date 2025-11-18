<?php
/**
 * Share Controller
 */
class ShareController {
    private $db;
    private $groupModel;
    private $userModel;

    public function __construct($db) {
        $this->db = $db;
        $this->groupModel = new Group($db);
        $this->userModel = new User($db);
    }

    /**
     * Share group with user
     * POST /api/groups/:groupId/share
     */
    public function share($groupId) {
        authenticate();
        $currentUser = getCurrentUser();
        $data = json_decode(file_get_contents('php://input'), true);

        // Only owner can share
        if (!$this->groupModel->isOwner($groupId, $currentUser['user_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Only the owner can share this group']);
            return;
        }

        // Validate input
        if (!isset($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            return;
        }

        $permission = isset($data['permission']) ? $data['permission'] : 'view';
        if (!in_array($permission, ['view', 'edit'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid permission type']);
            return;
        }

        // Find user to share with
        $shareWithUser = $this->userModel->findByEmail($data['email']);

        if (!$shareWithUser) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        // Cannot share with yourself
        if ($shareWithUser['id'] == $currentUser['user_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot share with yourself']);
            return;
        }

        try {
            $this->groupModel->share(
                $groupId,
                $shareWithUser['id'],
                $currentUser['user_id'],
                $permission
            );

            // Get group details for email
            $group = $this->groupModel->findById($groupId);
            $currentUserData = $this->userModel->findById($currentUser['user_id']);

            // Send notification email
            EmailSender::sendShareNotification(
                $shareWithUser['email'],
                $group['name'],
                $currentUserData['name'],
                $permission
            );

            echo json_encode(['message' => 'Group shared successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to share group']);
        }
    }

    /**
     * Unshare group
     * DELETE /api/groups/:groupId/share/:userId
     */
    public function unshare($groupId, $userId) {
        authenticate();
        $currentUser = getCurrentUser();

        // Only owner can unshare
        if (!$this->groupModel->isOwner($groupId, $currentUser['user_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Only the owner can unshare this group']);
            return;
        }

        try {
            $this->groupModel->unshare($groupId, $userId);
            echo json_encode(['message' => 'Group unshared successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to unshare group']);
        }
    }

    /**
     * Get all shares for a group
     * GET /api/groups/:groupId/shares
     */
    public function index($groupId) {
        authenticate();
        $currentUser = getCurrentUser();

        // Only owner can view shares
        if (!$this->groupModel->isOwner($groupId, $currentUser['user_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Only the owner can view shares']);
            return;
        }

        $shares = $this->groupModel->getShares($groupId);
        echo json_encode($shares);
    }
}
