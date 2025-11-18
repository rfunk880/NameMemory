<?php
/**
 * Person Controller
 */
class PersonController {
    private $db;
    private $personModel;
    private $groupModel;

    public function __construct($db) {
        $this->db = $db;
        $this->personModel = new Person($db);
        $this->groupModel = new Group($db);
    }

    /**
     * Get all people in a group
     * GET /api/groups/:groupId/people
     */
    public function index($groupId) {
        authenticate();
        $currentUser = getCurrentUser();

        // Check access
        if (!$this->groupModel->hasAccess($groupId, $currentUser['user_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }

        $people = $this->personModel->getByGroup($groupId);
        echo json_encode($people);
    }

    /**
     * Get single person
     * GET /api/people/:id
     */
    public function show($id) {
        authenticate();
        $currentUser = getCurrentUser();

        $person = $this->personModel->findById($id);

        if (!$person) {
            http_response_code(404);
            echo json_encode(['error' => 'Person not found']);
            return;
        }

        // Check access to group
        if (!$this->groupModel->hasAccess($person['group_id'], $currentUser['user_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }

        echo json_encode($person);
    }

    /**
     * Create new person
     * POST /api/groups/:groupId/people
     */
    public function create($groupId) {
        authenticate();
        $currentUser = getCurrentUser();

        // Check permission (need edit permission)
        $permission = $this->groupModel->getPermission($groupId, $currentUser['user_id']);
        if ($permission !== 'edit') {
            http_response_code(403);
            echo json_encode(['error' => 'You do not have permission to add people to this group']);
            return;
        }

        // Handle multipart form data (for file upload)
        $data = $_POST;
        $data['group_id'] = $groupId;

        // Validate required field
        if (!isset($data['first_name']) || trim($data['first_name']) === '') {
            http_response_code(400);
            echo json_encode(['error' => 'First name is required']);
            return;
        }

        // Handle photo upload
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $imageUrls = ImageOptimizer::processUpload($_FILES['photo']);

            if (!$imageUrls) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid image file']);
                return;
            }

            $data['photo_url'] = $imageUrls['photo_url'];
            $data['thumbnail_url'] = $imageUrls['thumbnail_url'];
        }

        try {
            $personId = $this->personModel->create($data);

            http_response_code(201);
            echo json_encode([
                'message' => 'Person created successfully',
                'id' => $personId
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create person']);
        }
    }

    /**
     * Update person
     * PUT/POST /api/people/:id
     */
    public function update($id) {
        authenticate();
        $currentUser = getCurrentUser();

        $person = $this->personModel->findById($id);

        if (!$person) {
            http_response_code(404);
            echo json_encode(['error' => 'Person not found']);
            return;
        }

        // Check permission
        $permission = $this->groupModel->getPermission($person['group_id'], $currentUser['user_id']);
        if ($permission !== 'edit') {
            http_response_code(403);
            echo json_encode(['error' => 'You do not have permission to edit this person']);
            return;
        }

        // Handle multipart form data
        $data = $_POST;

        // Validate required field
        if (!isset($data['first_name']) || trim($data['first_name']) === '') {
            http_response_code(400);
            echo json_encode(['error' => 'First name is required']);
            return;
        }

        // Keep existing photo URLs by default
        $data['photo_url'] = $person['photo_url'];
        $data['thumbnail_url'] = $person['thumbnail_url'];

        // Handle new photo upload
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            // Delete old images
            if ($person['photo_url']) {
                ImageOptimizer::deleteImages($person['photo_url'], $person['thumbnail_url']);
            }

            // Upload new images
            $imageUrls = ImageOptimizer::processUpload($_FILES['photo']);

            if (!$imageUrls) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid image file']);
                return;
            }

            $data['photo_url'] = $imageUrls['photo_url'];
            $data['thumbnail_url'] = $imageUrls['thumbnail_url'];
        }

        try {
            $this->personModel->update($id, $data);
            echo json_encode(['message' => 'Person updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update person']);
        }
    }

    /**
     * Delete person
     * DELETE /api/people/:id
     */
    public function delete($id) {
        authenticate();
        $currentUser = getCurrentUser();

        $person = $this->personModel->findById($id);

        if (!$person) {
            http_response_code(404);
            echo json_encode(['error' => 'Person not found']);
            return;
        }

        // Check permission
        $permission = $this->groupModel->getPermission($person['group_id'], $currentUser['user_id']);
        if ($permission !== 'edit') {
            http_response_code(403);
            echo json_encode(['error' => 'You do not have permission to delete this person']);
            return;
        }

        try {
            $this->personModel->delete($id);
            echo json_encode(['message' => 'Person deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete person']);
        }
    }
}
