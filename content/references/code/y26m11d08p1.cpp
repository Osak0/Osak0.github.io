#include <iostream>
#include <stack>
#include <vector>
#include "binary_tree.h"

// preorder traversal of a binary tree recursively
void preorderTraversal(BinaryTree<int>::Node* node) {
    if (node) {
        std::cout << node->data << " ";
        preorderTraversal(node->left);
        preorderTraversal(node->right);
    }
}

// preorder traversal of a binary tree iteratively
void preorderTraversalIterative(BinaryTree<int>::Node* root) {
    if (!root) return;
    BinaryTree<int>::Node* pointer;
    pointer = root;
    std::stack<BinaryTree<int>::Node*> tstack;
    while(!tstack.empty()||pointer){
        if(pointer) {
            std::cout << pointer->data << " ";
            tstack.push(pointer);
            pointer = pointer->left;
        } else {
            pointer = tstack.top();
            tstack.pop();
            pointer = pointer->right;
        }
    }
}

// preorder another method by vector
void inorderbyvector(BinaryTree<int>::Node* root) {
    if(!root) return;
    std::vector<BinaryTree<int>::Node*> tvector;
    tvector.push_back(root);
    while (!tvector.empty())
    {
        BinaryTree<int>::Node* pointer = tvector.back();
        tvector.pop_back();
        std::cout << pointer->data << " ";
        if (pointer->right) {
            tvector.push_back(pointer->right);
        }
        if (pointer->left) {
            tvector.push_back(pointer->left);
        }
    }
}

// inorder traversal of a binary tree recursively
void inorderTraversal(BinaryTree<int>::Node* node) {
    if (node) {
        inorderTraversal(node->left);
        std::cout << node->data << " ";
        inorderTraversal(node->right);
    }
}

// inorder traversal of a binary tree iteratively
void inorderTraversalIterative(BinaryTree<int>::Node* root) {
    if(!root) return;
    BinaryTree<int>::Node* pointer = root;
    std::stack<BinaryTree<int>::Node*> tsatck;
    while (!tsatck.empty()||pointer)
    {
        if (pointer)
        {
            tsatck.push(pointer);
            pointer = pointer->left;
        } else {
            pointer = tsatck.top();
            tsatck.pop();
            std::cout << pointer->data << " ";
            pointer = pointer->right;
        }
    }   
}

// postorder traversal of a binary tree recursively
void postorderTraversal(BinaryTree<int>::Node* node) {
    if (node) {
        postorderTraversal(node->left);
        postorderTraversal(node->right);
        std::cout << node->data << " ";
    }
}

int main() {
    BinaryTree<int> tree(nullptr);
    int arr[] = {5, 3, 7, 2, 4, 6, 8};
    int size = sizeof(arr) / sizeof(arr[0]);
    tree.createTree(arr, size);

    std::cout << "Preorder Traversal: ";
    preorderTraversal(tree.root);
    std::cout << std::endl;
    preorderTraversalIterative(tree.root);
    std::cout << '\n';
    inorderbyvector(tree.root);
    std::cout << "\n";

    std::cout << "Inorder Traversal: ";
    inorderTraversal(tree.root);
    std::cout << std::endl;
    inorderTraversalIterative(tree.root);
    std::cout << '\n';

    std::cout << "Postorder Traversal: ";
    postorderTraversal(tree.root);
    std::cout << std::endl;

    tree.deleteTree(tree.root);
    return 0;
}
