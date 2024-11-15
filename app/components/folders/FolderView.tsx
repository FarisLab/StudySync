'use client'
import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FolderType } from '../../hooks/useFolders';
import { Plus, Search, Book, PenTool, Brain, BookOpen } from 'lucide-react';
import { CreateNoteDialog } from '../topics/notes/CreateNoteDialog';
import { useNotification } from '@/app/hooks/useNotification';
import { Breadcrumb } from '@/app/components/common/Breadcrumb';
import { SpaceDocument, SpaceType } from '@/app/types/topics';
import { StudyDashboard } from '../topics/studies/StudyDashboard';
import { HubContent } from '../hub/HubContent';

interface FolderViewProps {
  folder: FolderType | null;
  isMindFolder?: boolean;
  isHubView?: boolean;
}

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

function hexToRgb(hex: string) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export const FolderView = ({ folder, isMindFolder, isHubView }: FolderViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const [spaces, setSpaces] = useState<SpaceDocument[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<SpaceDocument | null>(null);
  const { showNotification } = useNotification();

  const themeColor = folder ? themeColors[folder.theme as keyof typeof themeColors] : undefined;

  const fetchSpaces = useCallback(async () => {
    if (!folder?._id) return;
    
    try {
      const response = await fetch(`/api/spaces?folderId=${folder._id}`);
      if (!response.ok) throw new Error('Failed to fetch spaces');
      const data = await response.json();
      setSpaces(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching spaces:', err);
      }
      showNotification('error', 'Failed to fetch study modules');
    }
  }, [folder?._id, showNotification]);

  // Fetch spaces when folder changes
  useEffect(() => {
    if (folder) {
      fetchSpaces();
    }
  }, [folder, fetchSpaces]);

  const handleCreateSpace = async (type: SpaceType, title: string) => {
    if (!folder?._id) return;

    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          folderId: folder._id,
          content: getInitialContent(type),
        }),
      });

      if (!response.ok) throw new Error('Failed to create space');
      
      await fetchSpaces();
      showNotification('success', `${type} created successfully`);
      setIsCreateNoteOpen(false);
    } catch (err) {
      console.error('Error creating space:', err);
      showNotification('error', 'Failed to create study module');
    }
  };

  const getInitialContent = (type: SpaceType) => {
    switch (type) {
      case 'notes':
        return { text: '', lastEdited: new Date() };
      case 'quiz':
        return { questions: [], settings: { shuffleQuestions: true, showExplanations: true, passingScore: 70, allowRetries: true } };
      case 'flashcards':
        return { cards: [], settings: { reviewAlgorithm: 'spaced-repetition', showHints: true, autoPlay: false, cardsPerSession: 20 } };
      default:
        return {};
    }
  };

  const getSpaceIcon = (type: SpaceType) => {
    switch (type) {
      case 'notes': return <PenTool size={20} />;
      case 'quiz': return <Brain size={20} />;
      case 'flashcards': return <BookOpen size={20} />;
      default: return <Book size={20} />;
    }
  };

  const handleSpaceClick = (space: SpaceDocument) => {
    setSelectedSpace(space);
  };

  const handleBackToFolder = () => {
    setSelectedSpace(null);
  };

  // If a specific space is selected, show the StudyDashboard
  if (selectedSpace) {
    return (
      <StudyDashboard 
        space={selectedSpace}
        onBack={handleBackToFolder}
      />
    );
  }

  // Show HubContent by default or when isHubView is true
  if (!selectedSpace || isHubView) {
    return (
      <Container $themeColor={themeColor}>
        <HubContent recentSpaces={spaces} />
      </Container>
    );
  }

  // This will only be reached if we explicitly want to show the folder content
  return (
    <Container $themeColor={themeColor}>
      <Header>
        <HeaderContent>
          <Breadcrumb 
            path={folder ? [folder] : []}
            onNavigate={() => {}}
          />
          <Title>{folder ? folder.name : 'Home'}</Title>
          <Description>
            {isMindFolder 
              ? 'Your personal space for thoughts and ideas'
              : folder 
                ? `Organize your content in ${folder.name}`
                : 'Welcome back to your dashboard'
            }
          </Description>
        </HeaderContent>
        {folder && (
          <HeaderActions>
            <SearchWrapper>
              <SearchIcon size={16} />
              <SearchInput
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchWrapper>
            <ActionButton $themeColor={themeColor}>
              <Plus size={20} />
              <span>New Topic</span>
            </ActionButton>
            <KnowledgeButton $themeColor={themeColor}>
              <Book size={20} />
              <span>Knowledge</span>
            </KnowledgeButton>
          </HeaderActions>
        )}
      </Header>

      <Content>
        <Section $themeColor={themeColor}>
          <SectionHeader>
            <SectionTitle $themeColor={themeColor}>Study Modules</SectionTitle>
          </SectionHeader>

          <ModulesGrid>
            {spaces
              .filter(space => space.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(space => (
                <ModuleCard 
                  key={space._id} 
                  $themeColor={themeColor}
                  onClick={() => handleSpaceClick(space)}
                >
                  <ModuleIcon>{getSpaceIcon(space.type)}</ModuleIcon>
                  <ModuleTitle>{space.title}</ModuleTitle>
                  <ModuleType>{space.type}</ModuleType>
                  <ModuleStats>
                    {space.type === 'notes' && `Last edited: ${new Date(space.content.lastEdited).toLocaleDateString()}`}
                    {space.type === 'quiz' && `Average score: ${space.content.averageScore || 'No attempts'}`}
                    {space.type === 'flashcards' && `Cards: ${space.content.cards?.length || 0}`}
                  </ModuleStats>
                </ModuleCard>
              ))}

            <CreateModuleCard $themeColor={themeColor} onClick={() => setIsCreateNoteOpen(true)}>
              <Plus size={24} />
              <span>Create New Module</span>
            </CreateModuleCard>
          </ModulesGrid>
        </Section>
      </Content>

      <CreateNoteDialog 
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        onSubmit={(data) => handleCreateSpace('notes', data.title)}
      />
    </Container>
  );
};
const Container = styled.div<{ $themeColor?: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeIn 0.3s ease-out forwards;
  background: #1A1A1A;

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Header = styled.div`
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #2A2A2A;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #666666;
  font-size: 0.875rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  color: #666666;
`;

const SearchInput = styled.input`
  background: #2A2A2A;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  color: #FFFFFF;
  font-size: 0.875rem;
  width: 200px;
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    background: #3A3A3A;
    width: 250px;
  }

  &::placeholder {
    color: #666666;
  }
`;

const ActionButton = styled.button<{ $themeColor?: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$themeColor ? 
    `linear-gradient(rgba(${hexToRgb(props.$themeColor)}, 0.1), rgba(${hexToRgb(props.$themeColor)}, 0.05))` : 
    '#2A2A2A'};
  border: 1px solid ${props => props.$themeColor ? 
    `rgba(${hexToRgb(props.$themeColor)}, 0.2)` : 
    'transparent'};
  border-radius: 0.5rem;
  color: ${props => props.$themeColor || '#FFFFFF'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${props => props.$themeColor ? 
      `linear-gradient(rgba(${hexToRgb(props.$themeColor)}, 0.15), rgba(${hexToRgb(props.$themeColor)}, 0.1))` : 
      '#3A3A3A'};
    transform: translateY(-1px);
  }

  svg {
    color: ${props => props.$themeColor || '#FFFFFF'};
  }
`;

const KnowledgeButton = styled(ActionButton)`
  background: ${props => props.$themeColor ? 
    `linear-gradient(rgba(${hexToRgb(props.$themeColor)}, 0.15), rgba(${hexToRgb(props.$themeColor)}, 0.1))` : 
    '#3A3A3A'};
  
  &:hover {
    background: ${props => props.$themeColor ? 
      `linear-gradient(rgba(${hexToRgb(props.$themeColor)}, 0.2), rgba(${hexToRgb(props.$themeColor)}, 0.15))` : 
      '#4A4A4A'};
  }
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Section = styled.div<{ $themeColor?: string }>`
  background: #2A2A2A;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2<{ $themeColor?: string }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.$themeColor || '#FFFFFF'};
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ModuleCard = styled.div<{ $themeColor?: string }>`
  background: #2A2A2A;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease-out;
  border: 1px solid ${props => props.$themeColor ? `rgba(${hexToRgb(props.$themeColor)}, 0.1)` : 'transparent'};

  &:hover {
    transform: translateY(-2px);
    background: #3A3A3A;
    border-color: ${props => props.$themeColor ? `rgba(${hexToRgb(props.$themeColor)}, 0.2)` : 'transparent'};
  }
`;

const ModuleIcon = styled.div`
  color: #FFFFFF;
  margin-bottom: 1rem;
`;

const ModuleTitle = styled.h3`
  color: #FFFFFF;
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const ModuleType = styled.div`
  color: #666666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-transform: capitalize;
`;

const ModuleStats = styled.div`
  color: #999999;
  font-size: 0.75rem;
`;

const CreateModuleCard = styled(ModuleCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666666;

  &:hover {
    color: ${props => props.$themeColor || '#FFFFFF'};
  }
`;

