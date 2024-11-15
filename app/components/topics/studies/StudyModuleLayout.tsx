'use client'
import { ReactNode } from 'react';
import styled from 'styled-components';
import { ChevronLeft, Settings, Clock, Calendar, BarChart2 } from 'lucide-react';
import { SpaceDocument } from '@/app/types/topics';

interface StudyModuleLayoutProps {
  space: SpaceDocument;
  onBack: () => void;
  children: ReactNode;
  stats?: {
    timeSpent?: number;
    lastAccessed?: Date;
    progress?: number;
  };
}

export const StudyModuleLayout = ({ space, onBack, children, stats }: StudyModuleLayoutProps) => {
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
        <HeaderContent>
          <Title>{space.title}</Title>
          <Description>
            {space.description || `A ${space.type} space for your studies`}
          </Description>
        </HeaderContent>
        {stats && (
          <StatsBar>
            {stats.timeSpent !== undefined && (
              <StatItem>
                <Clock size={16} />
                <span>{Math.round(stats.timeSpent / 60)} minutes spent</span>
              </StatItem>
            )}
            {stats.lastAccessed && (
              <StatItem>
                <Calendar size={16} />
                <span>Last accessed {new Date(stats.lastAccessed).toLocaleDateString()}</span>
              </StatItem>
            )}
            {stats.progress !== undefined && (
              <StatItem>
                <BarChart2 size={16} />
                <span>{stats.progress}% complete</span>
              </StatItem>
            )}
          </StatsBar>
        )}
      </Header>

      <Content>
        {children}
      </Content>

      <Footer>
        <FooterContent>
          <LastSaved>
            Last saved: {new Date(space.updatedAt).toLocaleString()}
          </LastSaved>
        </FooterContent>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1A1A1A;
  color: #FFFFFF;
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

const HeaderContent = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: #666666;
  font-size: 0.875rem;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #2A2A2A;
  border-radius: 0.5rem;
  margin-top: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #999999;
  font-size: 0.875rem;

  svg {
    color: #666666;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  min-height: 0;
`;

const Footer = styled.footer`
  border-top: 1px solid #2A2A2A;
  padding: 1rem 1.5rem;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const LastSaved = styled.span`
  color: #666666;
  font-size: 0.75rem;
`; 