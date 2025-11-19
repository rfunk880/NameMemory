<?php
/**
 * Group Controller
 */
class GroupController {
    private $db;
    private $groupModel;

    public function __construct($db) {
        $this->db = $db;
        $this->groupModel = new Group($db);
    }

    /**
     * Get all groups (owned + shared)
     * GET /api/groups
     */
    public function index() {
        authenticate();
        $currentUser = getCurrentUser();

        $ownedGroups = $this->groupModel->getOwnedByUser($currentUser['user_id']);
        $sharedGroups = $this->groupModel->getSharedWithUser($currentUser['user_id']);

        // Add ownership flag
        foreach ($ownedGroups as &$group) {
            $group['is_owner'] = true;
            $group['permission'] = 'edit';
        }

        foreach ($sharedGroups as &$group) {
            $group['is_owner'] = false;
        }

        echo json_encode([
            'owned' => $ownedGroups,
            'shared' => $sharedGroups
        ]);
    }

    /**
     * Get single group
     * GET /api/groups/:id
     */
    public function show($id) {
        authenticate();
        $currentUser = getCurrentUser();

        // Check access
        if (!$this->groupModel->hasAccess($id, $currentUser['user_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }

        $group = $this->groupModel->findById($id);

        if (!$group) {
            http_response_code(404);
            echo json_encode(['error' => 'Group not found']);
            return;
        }

        // Add permission info
        $group['is_owner'] = $this->groupModel->isOwner($id, $currentUser['user_id']);
        $group['permission'] = $this->groupModel->getPermission($id, $currentUser['user_id']);

        echo json_encode($group);
    }

    /**
     * Create new group
     * POST /api/groups
     */
    public function create() {
        authenticate();
        $currentUser = getCurrentUser();
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate
        if (!isset($data['name']) || trim($data['name']) === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Group name is required']);
            return;
        }

        try {
            $groupId = $this->groupModel->create($data['name'], $currentUser['user_id']);

            http_response_code(201);
            echo json_encode([
                'message' => 'Group created successfully',
                'id' => $groupId
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create group: ' . $e->getMessage()]);
        }
    }

    /**
     * Update group
     * PUT /api/groups/:id
     */
    public function update($id) {
        authenticate();
        $currentUser = getCurrentUser();
        $data = json_decode(file_get_contents('php://input'), true);

        // Check permission
        $permission = $this->groupModel->getPermission($id, $currentUser['user_id']);
        if ($permission !== 'edit') {
            http_response_code(403);
            echo json_encode(['error' => 'You do not have permission to edit this group']);
            return;
        }

        // Validate
        if (!isset($data['name']) || trim($data['name']) === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Group name is required']);
            return;
        }

        try {
            $this->groupModel->update($id, $data['name']);
            echo json_encode(['message' => 'Group updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update group']);
        }
    }

    /**
     * Delete group
     * DELETE /api/groups/:id
     */
    public function delete($id) {
        authenticate();
        $currentUser = getCurrentUser();

        // Only owner can delete
        if (!$this->groupModel->isOwner($id, $currentUser['user_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Only the owner can delete this group']);
            return;
        }

        try {
            $this->groupModel->delete($id);
            echo json_encode(['message' => 'Group deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete group']);
        }
    }
}
