import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Question } from '../types';

export default function CreateVacancy() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: '', timeLimit: 60 }
  ]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills(skills.filter((skill) => skill !== skillToDelete));
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: String(questions.length + 1),
      text: '',
      timeLimit: 60
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: string | number) => {
    setQuestions(questions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Здесь будет отправка данных на бэкенд
    // const vacancyData = { title, keySkills: skills, questions, aiPrompt };
    // await fetch('/api/vacancies', { method: 'POST', body: JSON.stringify(vacancyData) });

    console.log('Создание вакансии:', {
      title,
      keySkills: skills,
      questions,
      aiPrompt
    });

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/vacancies');
    }, 2000);
  };

  const isFormValid = () => {
    return title.trim() !== '' &&
           skills.length > 0 &&
           questions.every((q) => q.text.trim() !== '') &&
           aiPrompt.trim() !== '';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Создание новой вакансии
      </Typography>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Вакансия успешно создана! Перенаправление...
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Название вакансии */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Название вакансии *
            </Typography>
            <TextField
              fullWidth
              placeholder="Например: Frontend разработчик (React)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Ключевые навыки */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Ключевые навыки для скрининга *
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Укажите навыки, технологии или требования, по которым нейросеть будет оценивать резюме кандидатов
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Например: React, TypeScript, 3+ года опыта"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddSkill}
                startIcon={<AddIcon />}
              >
                Добавить
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleDeleteSkill(skill)}
                  color="primary"
                />
              ))}
            </Box>
            {skills.length === 0 && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                Добавьте хотя бы один навык
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Вопросы для интервью */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Вопросы для интервью *
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Вопросы, которые бот будет задавать кандидату в Telegram
            </Typography>
            {questions.map((question, index) => (
              <Paper key={question.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Вопрос {index + 1}
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Введите текст вопроса"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      type="number"
                      label="Время на ответ (секунды)"
                      value={question.timeLimit}
                      onChange={(e) => handleQuestionChange(question.id, 'timeLimit', parseInt(e.target.value))}
                      inputProps={{ min: 30, max: 300 }}
                      sx={{ width: 200 }}
                    />
                  </Box>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteQuestion(question.id)}
                    disabled={questions.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddQuestion}
            >
              Добавить вопрос
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Промпт для AI */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Инструкции для нейросети *
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Опишите пожелания к кандидату, критерии оценки и любую другую информацию,
              которая поможет нейросети правильно анализировать ответы
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Например: Кандидат должен иметь опыт коммерческой разработки от 2 лет, знать современные практики разработки, уметь работать в команде. При оценке ответов обращайте внимание на глубину знаний, практический опыт и способность объяснять сложные концепции простым языком."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              required
            />
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Кнопки */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/vacancies')}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!isFormValid()}
            >
              Создать вакансию
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

