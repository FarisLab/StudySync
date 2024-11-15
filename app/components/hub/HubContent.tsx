'use client'
import styled from 'styled-components';
import { Calendar, BarChart2, Clock, Book, Star, TrendingUp } from 'lucide-react';
import { SpaceDocument } from '@/app/types/topics';

interface HubContentProps {
  recentSpaces?: SpaceDocument[];
}

export const HubContent = ({ recentSpaces = [] }: HubContentProps) => {
  return (
    <Container>
      <Header>
        <Title>Study Hub</Title>
        <Description>Your learning dashboard and progress overview</Description>
      </Header>

      <Content>
        {/* Stats Overview */}
        <StatsGrid>
          <StatCard>
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>12.5h</StatValue>
              <StatLabel>Study Time</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon>
              <Book size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>24</StatValue>
              <StatLabel>Active Topics</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon>
              <Star size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>85%</StatValue>
              <StatLabel>Completion Rate</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon>
              <TrendingUp size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>4.2</StatValue>
              <StatLabel>Daily Streak</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsGrid>

        <GridLayout>
          {/* Recent Activity */}
          <Section>
            <SectionHeader>
              <SectionTitle>Recent Activity</SectionTitle>
            </SectionHeader>
            <ActivityList>
              {recentSpaces?.map(space => (
                <ActivityItem key={space._id}>
                  <ActivityIcon>
                    {space.type === 'notes' && <Book size={16} />}
                    {space.type === 'quiz' && <BarChart2 size={16} />}
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityTitle>{space.title}</ActivityTitle>
                    <ActivityTime>Last edited {new Date(space.updatedAt).toLocaleDateString()}</ActivityTime>
                  </ActivityContent>
                </ActivityItem>
              ))}
            </ActivityList>
          </Section>

          {/* Calendar Overview */}
          <Section>
            <SectionHeader>
              <SectionTitle>Study Calendar</SectionTitle>
            </SectionHeader>
            <CalendarWrapper>
              <Calendar size={20} />
              <span>Calendar integration coming soon</span>
            </CalendarWrapper>
          </Section>
        </GridLayout>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
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

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background: #2A2A2A;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #FFFFFF;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666666;
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: #2A2A2A;
  border-radius: 0.5rem;
  padding: 1.5rem;
`;

const SectionHeader = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  color: #FFFFFF;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #1A1A1A;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #333333;
  }
`;

const ActivityIcon = styled.div`
  color: #3B82F6;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  color: #FFFFFF;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  color: #666666;
  font-size: 0.75rem;
`;

const CalendarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 200px;
  color: #666666;
`; 