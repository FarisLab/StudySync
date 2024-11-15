'use client'
import { useState, useEffect } from 'react';
import styled from 'styled-components';

interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string }) => void;
}

interface AnimationProps {
  $isClosing: boolean;
  $isVisible: boolean;
}

export const CreateNoteDialog = ({ isOpen, onClose, onSubmit }: CreateNoteDialogProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setTitle('');
      setError('');
    }, 200);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    onSubmit({ title: title.trim() });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <DialogOverlay 
      onClick={(e) => e.target === e.currentTarget && handleClose()} 
      $isClosing={isClosing} 
      $isVisible={isVisible}
    >
      <DialogContainer $isClosing={isClosing} $isVisible={isVisible}>
        <Title>Create New Note</Title>
        
        <InputGroup>
          <Label>Title</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            placeholder="Enter note title"
            error={!!error}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputGroup>

        <CreateButton onClick={handleSubmit}>Create</CreateButton>
      </DialogContainer>
    </DialogOverlay>
  );
};

const DialogOverlay = styled.div<AnimationProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.2s ease-out;
  ${props => props.$isVisible && `opacity: 1;`}
`;

const DialogContainer = styled.div<AnimationProps>`
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.3s ease-out, opacity 0.2s ease-out;
  ${props => props.$isVisible && `
    transform: translateY(0);
    opacity: 1;
  `}
`;

const Title = styled.h2`
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: #ffffff;
  font-size: 14px;
`;

const Input = styled.input<{ error?: boolean }>`
  background: #1a1a1a;
  border: 1px solid ${props => props.error ? '#ef4444' : 'transparent'};
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 14px;

  &::placeholder {
    color: #666666;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 12px;
  margin-top: -4px;
`;

const CreateButton = styled.button`
  background: #ffffff;
  color: #000000;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;

  &:hover {
    background: #f0f0f0;
  }
`;

// ... styled components remain the same ... 