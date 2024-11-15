'use client'
import { useState } from 'react';
import styled from 'styled-components';
import { SpaceDocument, SpaceType } from '@/app/types/topics';
import { Book, Brain, PenTool, Plus, Settings, ChevronLeft } from 'lucide-react';
import { useNotification } from '@/app/hooks/useNotification';
import { TopicContentView } from '../TopicContentView';

interface StudyDashboardProps {
  space: SpaceDocument;
  onBack: () => void;
}

export const StudyDashboard = ({ space, onBack }: StudyDashboardProps) => {
  const [activeModule, setActiveModule] = useState<SpaceDocument | null>(null);
  const { showNotification } = useNotification();

  const handleCreateModule = async (type: SpaceType) => {
    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: `New ${type}`,
          folderId: space.folderId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create module');
      
      const newModule = await response.json();
      setActiveModule(newModule);
      showNotification('success', `${type} module created successfully`);
    } catch (error) {
      console.error('Error creating module:', error);
      showNotification('error', 'Failed to create module');
    }
  };

  const renderModuleContent = () => {
    if (!activeModule) return null;

    switch (activeModule.type) {
      case 'notes':
        return <TopicContentView space={activeModule} />;
      case 'quiz':
        return <div>Quiz module coming soon</div>;
      case 'flashcards':
        return <div>Flashcards module coming soon</div>;
      default:
        return <div>Unsupported module type</div>;
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTop>
          <BackButton onClick={onBack}>
            <ChevronLeft size={20} />
            Back to Folder
          </BackButton>
          <HeaderActions>
            <IconButton>
              <Settings size={20} />
            </IconButton>
          </HeaderActions>
        </HeaderTop>
        <Title>{space.title}</Title>
      </Header>

      <Content>
        {activeModule ? (
          renderModuleContent()
        ) : (
          <ModulesGrid>
            <ModuleCard onClick={() => handleCreateModule('notes')}>
              <ModuleIcon>
                <PenTool size={24} />
              </ModuleIcon>
              <ModuleTitle>Notes</ModuleTitle>
              <ModuleDescription>
                Create and organize your study notes
              </ModuleDescription>
            </ModuleCard>

            <ModuleCard onClick={() => handleCreateModule('quiz')}>
              <ModuleIcon>
                <Brain size={24} />
              </ModuleIcon>
              <ModuleTitle>Quiz</ModuleTitle>
              <ModuleDescription>
                Test your knowledge with practice questions
              </ModuleDescription>
            </ModuleCard>

            <ModuleCard onClick={() => handleCreateModule('flashcards')}>
              <ModuleIcon>
                <Book size={24} />
              </ModuleIcon>
              <ModuleTitle>Flashcards</ModuleTitle>
              <ModuleDescription>
                Review concepts with spaced repetition
              </ModuleDescription>
            </ModuleCard>

            <CreateModuleCard>
              <Plus size={24} />
              <span>Create Custom Module</span>
            </CreateModuleCard>
          </ModulesGrid>
        )}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1A1A1A;
  min-height: 0;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #2A2A2A;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666666;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #FFFFFF;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  color: #666666;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: #2A2A2A;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #FFFFFF;
`;

const Content = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  min-height: 0;
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const ModuleCard = styled.div`
  background: #2A2A2A;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: #3A3A3A;
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

const ModuleDescription = styled.p`
  color: #666666;
  font-size: 0.875rem;
`;

const CreateModuleCard = styled(ModuleCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666666;

  &:hover {
    color: #FFFFFF;
  }
`; 