#include <iostream>

template <typename T>
class BinaryTree {
public:
    struct Node {
        T data;
        Node* left;
        Node* right;
        Node(const T& value) : data(value), left(nullptr), right(nullptr) {}
    };

    Node* root;

    BinaryTree(Node* r) : root(r) {}
    void insert(Node*& node, const T& value) {
        if (!node) {
            node = new Node(value);
        } else if (value < node->data) {
            insert(node->left, value);
        } else {
            insert(node->right, value);
        }
    }
    void deleteTree(Node* node) {
        if (node) {
            deleteTree(node->left);
            deleteTree(node->right);
            delete node;
        }
    }
    void createTree(const T* arr, int size) {
        for (int i = 0; i < size; ++i) {
            insert(root, arr[i]);
        }
    }
    
};
