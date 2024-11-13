'use client'
import React, { useState } from 'react';
import styled from 'styled-components';
import { Save, Paperclip, Tag } from 'lucide-react';
import { useNotification } from '@/app/contexts/NotificationContext';

interface NotesEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  isSaving?: boolean;
}

export const NotesEditor = ({ initialContent = '', onSave, isSaving }: NotesEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const { showNotification } = useNotification();

  const handleSave = async () => {
    try {
      await onSave(content);
      showNotification('success', 'Note saved successfully');
    } catch {
      showNotification('error', 'Failed to save note');
    }
  };

  return (
    <EditorContainer>
      <Toolbar>
        <ToolbarButton onClick={handleSave} disabled={isSaving}>
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save'}
        </ToolbarButton>
        <ToolbarButton>
          <Paperclip size={16} />
          Attach
        </ToolbarButton>
        <ToolbarButton>
          <Tag size={16} />
          Tags
        </ToolbarButton>
      </Toolbar>

      <EditorContent
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        placeholder="Start writing your note..."
      />
    </EditorContainer>
  );
};

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1A1A1A;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #2A2A2A;
  border-bottom: 1px solid #3A3A3A;
`;

const ToolbarButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.disabled ? '#3A3A3A' : '#1A1A1A'};
  border: none;
  border-radius: 0.25rem;
  color: ${props => props.disabled ? '#666666' : '#FFFFFF'};
  font-size: 0.875rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease-out;

  &:hover:not(:disabled) {
    background: #3A3A3A;
  }
`;

const EditorContent = styled.textarea`
  flex: 1;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-size: 1rem;
  line-height: 1.5;
  resize: none;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #666666;
  }
`; 