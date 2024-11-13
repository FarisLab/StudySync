'use client'
import { useState } from 'react';
import styled from 'styled-components';
import { FolderType } from '../hooks/useFolders';
import { Plus, Search, Book, BarChart2, Clock, Layout } from 'lucide-react';
import { CreateNoteDialog } from './topics/notes/CreateNoteDialog';
import { useNotification } from '@/app/hooks/useNotification';

interface FolderViewProps {
  folder: FolderType | null;
  isMindFolder?: boolean;
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
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

export const FolderView = ({ folder, isMindFolder }: FolderViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState(false);
  const { showNotification } = useNotification();

  const themeColor = folder ? themeColors[folder.theme as keyof typeof themeColors] : undefined;

  const handleCreateNote = async (noteData: { title: string }) => {
    try {
      await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'notes',
          title: noteData.title,
          folderId: folder?._id,
          content: {
            text: '',
            lastEdited: new Date(),
          },
        }),
      });
      showNotification('success', 'Note created successfully');
      setIsCreateNoteOpen(false);
    } catch (err) {
      console.error('Error creating note:', err);
      showNotification('error', 'Failed to create note');
    }
  };

  return (
    <Container $themeColor={themeColor}>
      <Header>
        <HeaderContent>
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
        {folder ? (
          <>
            <Section $themeColor={themeColor}>
              <SectionHeader>
                <SectionTitle $themeColor={themeColor}>
                  <Layout size={20} />
                  Create New Topic
                </SectionTitle>
              </SectionHeader>
              <TopicGrid>
                <NewTopicCard $themeColor={themeColor} onClick={() => setIsCreateNoteOpen(true)}>
                  <NewTopicIcon>✨</NewTopicIcon>
                  <NewTopicTitle>Notes</NewTopicTitle>
                  <NewTopicDescription>Create organized notes and summaries</NewTopicDescription>
                </NewTopicCard>
                <NewTopicCard $themeColor={themeColor}>
                  <NewTopicIcon>📝</NewTopicIcon>
                  <NewTopicTitle>Practice Quiz</NewTopicTitle>
                  <NewTopicDescription>Test your knowledge</NewTopicDescription>
                </NewTopicCard>
                <NewTopicCard $themeColor={themeColor}>
                  <NewTopicIcon>🎯</NewTopicIcon>
                  <NewTopicTitle>Flashcards</NewTopicTitle>
                  <NewTopicDescription>Review key concepts</NewTopicDescription>
                </NewTopicCard>
              </TopicGrid>
            </Section>

            <Section $themeColor={themeColor}>
              <SectionHeader>
                <SectionTitle style={{ color: themeColor }}>
                  <Clock size={20} />
                  Recent Topics
                </SectionTitle>
                <ViewAll>View All</ViewAll>
              </SectionHeader>
              <EmptyState>
                <EmptyIcon>🔍</EmptyIcon>
                <EmptyTitle>No recent topics</EmptyTitle>
                <EmptyDescription>
                  Your recently accessed topics will appear here
                </EmptyDescription>
              </EmptyState>
            </Section>

            <Section $themeColor={themeColor}>
              <SectionHeader>
                <SectionTitle style={{ color: themeColor }}>
                  <BarChart2 size={20} />
                  Progress & Statistics
                </SectionTitle>
              </SectionHeader>
              <StatsGrid>
                <StatCard $themeColor={themeColor}>
                  <StatValue>0</StatValue>
                  <StatLabel>Total Topics</StatLabel>
                </StatCard>
                <StatCard $themeColor={themeColor}>
                  <StatValue>0h</StatValue>
                  <StatLabel>Study Time</StatLabel>
                </StatCard>
                <StatCard $themeColor={themeColor}>
                  <StatValue>0</StatValue>
                  <StatLabel>Notes Created</StatLabel>
                </StatCard>
              </StatsGrid>
            </Section>
          </>
        ) : (
          <RecentSection>
            <SectionTitle className="recent">Recent Activity</SectionTitle>
            <EmptyState>
              <EmptyIcon>🔍</EmptyIcon>
              <EmptyTitle>No recent activity</EmptyTitle>
              <EmptyDescription>
                Your recent activities will appear here
              </EmptyDescription>
            </EmptyState>
          </RecentSection>
        )}
      </Content>

      <CreateNoteDialog 
        isOpen={isCreateNoteOpen}
        onClose={() => setIsCreateNoteOpen(false)}
        onSubmit={handleCreateNote}
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
  padding: 2rem;
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

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: #2A2A2A;
  border-radius: 1rem;
  margin-top: 2rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #3A3A3A;
  }
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  transform: scale(1);
  transition: transform 0.2s ease-in-out;

  ${EmptyState}:hover & {
    transform: scale(1.1);
  }
`;

const EmptyTitle = styled.h3`
  color: #FFFFFF;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  color: #666666;
  font-size: 0.875rem;
  max-width: 24rem;
  margin-bottom: 1.5rem;
`;

const RecentSection = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2<{ $themeColor?: string }>`
  color: ${props => props.$themeColor || '#FFFFFF'};
  font-size: 1.25rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: ${props => props.className?.includes('recent') ? '1rem' : '0'};

  svg {
    color: ${props => props.$themeColor || '#FFFFFF'};
  }
`;

const ViewAll = styled.button`
  color: #666666;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #FFFFFF;
  }
`;

const TopicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const NewTopicCard = styled.div<{ $themeColor?: string }>`
  background: #1A1A1A;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid ${props => props.$themeColor ? `rgba(${hexToRgb(props.$themeColor)}, 0.1)` : '#2A2A2A'};

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.$themeColor ? `rgba(${hexToRgb(props.$themeColor)}, 0.2)` : '#3A3A3A'};
  }
`;

const NewTopicIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const NewTopicTitle = styled.h3`
  color: #FFFFFF;
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const NewTopicDescription = styled.p`
  color: #666666;
  font-size: 0.875rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const StatCard = styled.div<{ $themeColor?: string }>`
  background: #1A1A1A;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  border: 1px solid ${props => props.$themeColor ? `rgba(${hexToRgb(props.$themeColor)}, 0.1)` : '#2A2A2A'};
  transition: all 0.2s ease-out;

  &:hover {
    border-color: ${props => props.$themeColor ? `rgba(${hexToRgb(props.$themeColor)}, 0.2)` : '#3A3A3A'};
  }
`;

const StatValue = styled.div`
  color: #FFFFFF;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666666;
  font-size: 0.875rem;
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

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Section = styled.section<{ $themeColor?: string }>`
  background: #1A1A1A;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.$themeColor ? `rgba(${hexToRgb(props.$themeColor)}, 0.1)` : '#2A2A2A'};
  transition: all 0.2s ease-out;

  &:hover {
    border-color: ${props => props.$themeColor ? `rgba(${hexToRgb(props.$themeColor)}, 0.2)` : '#3A3A3A'};
  }
`;
