import { Component, AfterViewInit, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-sudoku',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Footer],
  templateUrl: './sudoku.html',
  styleUrls: ['./sudoku.css']
})
export class Sudoku implements AfterViewInit, OnInit {
  grid: number[][] = [];
  initialGrid: number[][] = [];
  solutionGrid: number[][] = []; // ← menyimpan solusi lengkap
  errors: boolean[][] = [];
  
  selectedNumber: number | null = null;
  numberCounts: number[] = Array(10).fill(0);
  errorMessage: string | null = null;
  errorTimeout: any = null;

  sidebarOpen: boolean = false;
  isDarkMode: boolean = false;

  constructor(private renderer: Renderer2) {
    this.newGame();
  }

  ngOnInit(): void {
    this.checkDarkMode();
  }

  ngAfterViewInit(): void {
    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.removeClass(document.body, 'sidebar-collapse');
    this.renderer.addClass(document.body, 'sidebar-closed');
    this.sidebarOpen = false;
  }

  // ----- DARK MODE -----
  checkDarkMode(): void {
    this.isDarkMode = document.body.classList.contains('dark-mode');
  }

  toggleDarkMode(): void {
    if (this.isDarkMode) {
      this.renderer.removeClass(document.body, 'dark-mode');
      this.isDarkMode = false;
    } else {
      this.renderer.addClass(document.body, 'dark-mode');
      this.isDarkMode = true;
    }
  }

  // ----- SIDEBAR -----
  toggleSidebar(): void {
    if (this.sidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar(): void {
    this.renderer.removeClass(document.body, 'sidebar-closed');
    this.renderer.addClass(document.body, 'sidebar-open');
    this.sidebarOpen = true;
  }

  closeSidebar(): void {
    this.renderer.removeClass(document.body, 'sidebar-open');
    this.renderer.addClass(document.body, 'sidebar-closed');
    this.sidebarOpen = false;
  }

  // ----- LOGIKA SUDOKU -----
  private createEmptyGrid(): number[][] {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  private copyGrid(grid: number[][]): number[][] {
    return grid.map(row => [...row]);
  }

  private updateNumberCounts(): void {
    const counts = Array(10).fill(0);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.grid[r][c];
        if (val > 0) counts[val]++;
      }
    }
    this.numberCounts = counts;
  }

  newGame(): void {
    const solution = this.generateSolution();
    this.solutionGrid = this.copyGrid(solution);

    const puzzle = this.copyGrid(solution);
    const cellsToRemove = 45 + Math.floor(Math.random() * 10);
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }
    this.grid = puzzle;
    this.initialGrid = this.copyGrid(puzzle);
    this.errors = this.createEmptyGrid().map(() => Array(9).fill(false));
    this.selectedNumber = null;
    this.updateNumberCounts();
    this.clearError();
  }

  private generateSolution(): number[][] {
    const board = this.createEmptyGrid();
    this.solveSudoku(board);
    return board;
  }

  private solveSudoku(board: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = this.shuffleArray([1,2,3,4,5,6,7,8,9]);
          for (const num of nums) {
            if (this.isValid(board, row, col, num)) {
              board[row][col] = num;
              if (this.solveSudoku(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private shuffleArray(arr: any[]): any[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
    for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
    const startRow = Math.floor(row/3)*3, startCol = Math.floor(col/3)*3;
    for (let r = startRow; r < startRow+3; r++)
      for (let c = startCol; c < startCol+3; c++)
        if (board[r][c] === num) return false;
    return true;
  }

  // Cek apakah angka yang dimasukkan sesuai solusi
  private isCorrectNumber(row: number, col: number, num: number): boolean {
    return this.solutionGrid[row][col] === num;
  }

  selectNumber(num: number): void {
    if (this.numberCounts[num] >= 9) {
      this.showError('Angka ' + num + ' sudah habis digunakan!');
      return;
    }
    this.selectedNumber = num;
    this.clearError();
  }

  onCellClick(row: number, col: number): void {
    // Jika sel adalah petunjuk awal, tidak bisa diubah
    if (this.initialGrid[row][col] !== 0) {
      this.showError('Sel ini adalah petunjuk awal, tidak bisa diubah.');
      return;
    }
    if (this.selectedNumber === null) {
      this.showError('Silakan pilih angka terlebih dahulu!');
      return;
    }

    const num = this.selectedNumber;
    if (this.numberCounts[num] >= 9) {
      this.showError('Angka ' + num + ' sudah habis digunakan!');
      this.selectedNumber = null;
      return;
    }

    // Hapus angka lama jika ada (untuk update counts)
    const oldVal = this.grid[row][col];
    if (oldVal !== 0) {
      this.numberCounts[oldVal]--;
    }

    // Cek apakah angka sesuai solusi
    if (!this.isCorrectNumber(row, col, num)) {
      // Salah: tandai error permanen
      this.errors[row][col] = true;
      this.showError('Angka ' + num + ' tidak sesuai dengan solusi!');
      // Tetap masukkan angka, biar terlihat
      this.grid[row][col] = num;
      this.numberCounts[num]++;
      this.updateNumberCounts();
      this.selectedNumber = null;
      // Error tetap merah sampai diganti
      return;
    }

    // Benar: masukkan angka dan hilangkan error jika ada
    this.grid[row][col] = num;
    this.errors[row][col] = false;
    this.numberCounts[num]++;
    this.updateNumberCounts();
    this.selectedNumber = null;
    this.clearError();

    // Cek kemenangan
    if (this.isGridComplete()) {
      alert('Selamat! Anda berhasil menyelesaikan Sudoku! 🎉');
    }
  }

  private isGridComplete(): boolean {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (this.grid[r][c] === 0) return false;
    return true;
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }

  clearError(): void {
    this.errorMessage = null;
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }

  clearSelectedCell(row: number, col: number): void {
    if (this.initialGrid[row][col] !== 0) {
      this.showError('Sel ini adalah petunjuk awal, tidak bisa dihapus.');
      return;
    }
    if (this.grid[row][col] === 0) return;
    const val = this.grid[row][col];
    this.grid[row][col] = 0;
    this.errors[row][col] = false; // hapus error karena kosong
    this.numberCounts[val]--;
    this.updateNumberCounts();
  }

  solve(): void {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.initialGrid[r][c] === 0) {
          this.grid[r][c] = this.solutionGrid[r][c];
          this.errors[r][c] = false;
        }
      }
    }
    this.updateNumberCounts();
    this.selectedNumber = null;
    this.clearError();
  }

  reset(): void {
    this.grid = this.copyGrid(this.initialGrid);
    this.errors = this.createEmptyGrid().map(() => Array(9).fill(false));
    this.selectedNumber = null;
    this.updateNumberCounts();
    this.clearError();
  }

  isEditable(row: number, col: number): boolean {
    return this.initialGrid[row][col] === 0;
  }

  isError(row: number, col: number): boolean {
    return this.errors[row] && this.errors[row][col];
  }

  isNumberDisabled(num: number): boolean {
    return this.numberCounts[num] >= 9;
  }

  getRemainingCount(num: number): number {
    return 9 - this.numberCounts[num];
  }
}