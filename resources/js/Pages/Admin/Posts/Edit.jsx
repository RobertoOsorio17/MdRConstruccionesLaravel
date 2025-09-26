import React from 'react';
import PostForm from './Create';

const EditPost = ({ post, categories, tags, authors }) => {
    return (
        <PostForm 
            post={post} 
            categories={categories} 
            tags={tags} 
            authors={authors} 
            isEdit={true} 
        />
    );
};

export default EditPost;