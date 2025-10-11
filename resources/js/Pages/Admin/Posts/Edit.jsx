import React from 'react';
import PostForm from './Create';

const EditPost = ({ post, categories, tags, authors, revisions }) => {
    return (
        <PostForm
            post={post}
            categories={categories}
            tags={tags}
            authors={authors}
            revisions={revisions}
            isEdit={true}
        />
    );
};

export default EditPost;
