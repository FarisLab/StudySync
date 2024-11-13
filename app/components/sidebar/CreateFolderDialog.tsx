'use client'
import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Folder, Mouse, Camera, Eraser, TestTube, Trash, FileBox, Send, Inbox } from 'lucide-react';

interface CreateFolderDialogProps {
  onClose: () => void;
  onSubmit: (folderData: {
    name: string;
    theme: string;
    icon: string;
  }) => void;
}

interface AnimationProps {
  $isClosing: boolean;
  $isVisible: boolean;
}

// Theme colors mapping
const themeColors = {
  lime: '#84cc16',
  lychee: '#ec4899',
  mango: '#f97316',
  plum: '#a855f7',
  blueberry: '#3b82f6',
  kiwi: '#22c55e',
  pitaya: '#d946ef',
  smoothie: '#06b6d4',
  macaron: '#f43f5e',
};

// Icon components mapping
const iconComponents = {
  'Computer Mouse': Mouse,
  'Photo Stack': FileBox,
  'Camera': Camera,
  'Eraser': Eraser,
  'Test Tube': TestTube,
  'Trash': Trash,
  'Folder': Folder,
  'Paperplane': Send,
  'Tray': Inbox,
};

export const CreateFolderDialog = ({ onClose, onSubmit }: CreateFolderDialogProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('Lime');
  const [icon, setIcon] = useState('Computer Mouse');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [error, setError] = useState('');

  const themeRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (themeRef.current && !themeRef.current.contains(target)) {
        setShowThemeDropdown(false);
      }
      if (iconRef.current && !iconRef.current.contains(target)) {
        setShowIconDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter a folder name');
      return;
    }
    
    onSubmit({ 
      name: name.trim(), 
      theme: theme.toLowerCase(), 
      icon 
    });
    handleClose();
  };

  const IconComponent = iconComponents[icon as keyof typeof iconComponents];

  return (
    <DialogOverlay 
      onClick={(event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }} 
      $isClosing={isClosing} 
      $isVisible={isVisible}
    >
      <DialogContainer $isClosing={isClosing} $isVisible={isVisible}>
        <Title>Create folder</Title>
        
        <InputGroup>
          <Label>Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setName(event.target.value);
              setError('');
            }}
            placeholder="Software Development"
            error={!!error}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputGroup>

        <OptionsGroup>
          <ThemeSection ref={themeRef}>
            <Label>Theme</Label>
            <SelectButton onClick={() => setShowThemeDropdown(!showThemeDropdown)}>
              <ColorDot $color={themeColors[theme.toLowerCase() as keyof typeof themeColors]} />
              {theme}
            </SelectButton>
            {showThemeDropdown && (
              <DropdownMenu>
                {Object.entries(themeColors).map(([key, color]) => (
                  <DropdownItem key={key} onClick={() => {
                    setTheme(key.charAt(0).toUpperCase() + key.slice(1));
                    setShowThemeDropdown(false);
                  }}>
                    <ColorDot $color={color} />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </ThemeSection>

          <IconSection ref={iconRef}>
            <Label>Icon</Label>
            <SelectButton onClick={() => setShowIconDropdown(!showIconDropdown)}>
              {IconComponent && <IconComponent size={16} />}
              {icon}
            </SelectButton>
            {showIconDropdown && (
              <DropdownMenu>
                {Object.keys(iconComponents).map((iconName) => {
                  const Icon = iconComponents[iconName as keyof typeof iconComponents];
                  return (
                    <DropdownItem key={iconName} onClick={() => {
                      setIcon(iconName);
                      setShowIconDropdown(false);
                    }}>
                      <Icon size={16} />
                      {iconName}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            )}
          </IconSection>
        </OptionsGroup>

        <CreateButton onClick={handleSubmit}>Create</CreateButton>
      </DialogContainer>
    </DialogOverlay>
  );
};

// Update styled components
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

const ColorDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$color};
`;

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

const OptionsGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const ThemeSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IconSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SelectButton = styled.button`
  background: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
  font-size: 14px;
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

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1001;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #ffffff;

  &:hover {
    background: #2a2a2a;
  }
`; 