import React, { useState } from 'react';
import { 
  Box, TextField, MenuItem, Button, Typography, Paper, 
  Grid, Divider, IconButton, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip 
} from '@mui/material'; // Убедитесь, что MUI v6 или v5

// Иконки
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Данные
import { PROFILES } from '../db/profiles'; 
import { GLAZING_LIST } from '../db/doubleGlazingList';
import { calculateFullStats } from '../utils/utils';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoiceDocument } from './PdfDocument';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


// Тип для элемента в списке
interface CartItem {
  id: string; // Уникальный ID для удаления
  width: number;
  height: number;
  quantity: number;
  profileName: string;
  glazingName: string;
  pricePerUnit: number; // Цена за 1 шт
  totalPrice: number;   // Цена * кол-во
  area: number;
}

export default function SimpleCalculator() {
  // --- Состояние ввода (текущее окно) ---
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(1400);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(PROFILES[0]?.id || '');
  const [selectedGlazingId, setSelectedGlazingId] = useState<string>(GLAZING_LIST[0]?.id || '');

  // --- Состояние списка (корзина) ---
  const [items, setItems] = useState<CartItem[]>([]);

  // Добавить текущее окно в список
  const handleAddItem = () => {
    const profile = PROFILES.find(p => p.id === selectedProfileId);
    const glazing = GLAZING_LIST.find(g => g.id === selectedGlazingId);

    if (profile && glazing) {
      // 1. Считаем цену за 1 окно
      const stats = calculateFullStats(width, height, profile, glazing);
      
      if (!stats.isValid) {
        alert(stats.error);
        return;
      }

      // 2. Создаем объект строки
      const newItem: CartItem = {
        id: crypto.randomUUID(), // Уникальный ключ
        width,
        height,
        quantity,
        profileName: profile.name,
        glazingName: glazing.name,
        pricePerUnit: stats.priceTotal,
        totalPrice: stats.priceTotal * quantity,
        area: stats.area * quantity
      };

      // 3. Добавляем в массив
      setItems(prev => [...prev, newItem]);
    }
  };

  // Удалить строку
  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Очистить всё
  const handleClearAll = () => {
    if(confirm('Очистить весь список?')) setItems([]);
  };

  // ИТОГО ПО ВСЕМУ СПИСКУ
  const grandTotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalArea = items.reduce((acc, item) => acc + item.area, 0);

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }} elevation={3}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartCheckoutIcon color="primary" /> Калькулятор заказа
      </Typography>
      
      {/* --- ФОРМА ВВОДА --- */}
      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Параметры нового окна</Typography>
        
        {/* Используем Grid size (для MUI v6) */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField label="Ширина" type="number" size="small" fullWidth
              value={width} onChange={e => setWidth(+e.target.value)} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField label="Высота" type="number" size="small" fullWidth
              value={height} onChange={e => setHeight(+e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Количество" type="number" size="small" fullWidth
              value={quantity} onChange={e => setQuantity(Math.max(1, +e.target.value))} />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
             <TextField select label="Профиль" size="small" fullWidth
                value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)}>
                {PROFILES.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
             </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
             <TextField select label="Стеклопакет" size="small" fullWidth
                value={selectedGlazingId} onChange={e => setSelectedGlazingId(e.target.value)}>
                {GLAZING_LIST.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
             </TextField>
          </Grid>
        </Grid>

        <Button 
          variant="contained" 
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddItem}
          fullWidth
        >
          Добавить в список
        </Button>
      </Box>

      {/* --- ТАБЛИЦА РЕЗУЛЬТАТОВ --- */}
      {items.length > 0 ? (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                <TableRow>
                  <TableCell>Размер</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell align="center">Кол-во</TableCell>
                  <TableCell align="right">Цена</TableCell>
                  <TableCell align="right">Сумма</TableCell>
                  <TableCell width={40}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <b>{item.width} x {item.height}</b>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                      {item.profileName}<br/>
                      {item.glazingName}
                    </TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{item.pricePerUnit} €</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {item.totalPrice} €
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* --- ИТОГИ --- */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
             <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={`Всего окон: ${totalCount}`} size="small" />
                <Chip label={`Площадь: ${totalArea.toFixed(2)} м²`} size="small" />
             </Box>
             
             <Typography variant="h4" color="primary" fontWeight="bold">
                Итого: {grandTotal.toLocaleString()} €
             </Typography>
             
             <Button size="small" startIcon={<RestartAltIcon />} onClick={handleClearAll} color="secondary">
                Очистить расчет
             </Button>

              {/* === КНОПКА PDF === */}
                <PDFDownloadLink 
                  document={<InvoiceDocument items={items} grandTotal={grandTotal} />} 
                  fileName="raschet_okon.pdf"
                  style={{ textDecoration: 'none' }}
                >
                  {/* @ts-ignore - React-PDF типы иногда шалят с children-функцией */}
                  {({ loading }) => (
                    <Button 
                      variant="contained" 
                      color="success" 
                      startIcon={<PictureAsPdfIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Создание PDF...' : 'Скачать PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
          </Box>

          
        </>
      ) : (
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          Список пуст. Добавьте первое окно.
        </Typography>
      )}

    </Paper>
  );
}