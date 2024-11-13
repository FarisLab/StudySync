'use client'
import React, { useState } from 'react';
import styled from 'styled-components';
import { NotesEditor } from './topics/notes/NotesEditor';
import { NoteSpace } from '@/app/types/topics';
import { useNotification } from '@/app/hooks/useNotification';

interface NotesViewProps {
  space: NoteSpace;
  onUpdate?: (spaceId: string, content: Partial<NoteSpace['content']>) => Promise<void>;
}

export const NotesView = ({ space, onUpdate }: NotesViewProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();

  const handleSave = async (text: string) => {
    if (!onUpdate) return;

    try {
      setIsSaving(true);
      await onUpdate(space._id, {
        text,
        lastEdited: new Date(),
      });
      showNotification('success', 'Note saved successfully');
    } catch (error) {
      showNotification('error', 'Failed to save note');
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{space.title}</Title>
        <LastEdited>
          Last edited: {space.content.lastEdited.toLocaleString()}
        </LastEdited>
      </Header>

      <EditorContainer>
        <NotesEditor
          initialContent={space.content.text}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </EditorContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1A1A1A;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1rem;
  background: #2A2A2A;
  border-bottom: 1px solid #3A3A3A;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 0.5rem;
`;

const LastEdited = styled.p`
  color: #666666;
  font-size: 0.875rem;
`;

const EditorContainer = styled.div`
  flex: 1;
  overflow: hidden;
`; 