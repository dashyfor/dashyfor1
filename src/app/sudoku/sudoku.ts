import { Component } from '@angular/core';
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
export class Sudoku {
  grid: number[][] = [];
  initialGrid: number[][] = [];
  errors: boolean[][] = [];
  
  // Angka yang sedang dipilih (1-9) atau null
  selectedNumber: number | null = null;
  
  // Menyimpan jumlah kemunculan angka 1-9 di grid saat ini
  numberCounts: number[] = Array(10).fill(0); // index 0 tidak dipakai

  // Flag untuk menampilkan pesan error sementara
  errorMessage: string | null = null;
  errorTimeout: any = null;

  constructor() {
    this.newGame();
  }

  private createEmptyGrid(): number[][] {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  private copyGrid(grid: number[][]): number[][] {
    return grid.map(row => [...row]);
  }

  // Menghitung jumlah masing-masing angka di grid
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

  // Cek validitas di grid saat ini untuk pengecekan error
  private isValidInContext(grid: number[][], row: number, col: number, num: number): boolean {
    for (let c = 0; c < 9; c++) if (c !== col && grid[row][c] === num) return false;
    for (let r = 0; r < 9; r++) if (r !== row && grid[r][col] === num) return false;
    const startRow = Math.floor(row/3)*3, startCol = Math.floor(col/3)*3;
    for (let r = startRow; r < startRow+3; r++)
      for (let c = startCol; c < startCol+3; c++)
        if ((r !== row || c !== col) && grid[r][c] === num) return false;
    return true;
  }

  // Saat tombol angka diklik
  selectNumber(num: number): void {
    // Jika angka sudah habis (count == 9), tidak bisa dipilih
    if (this.numberCounts[num] >= 9) {
      this.showError('Angka ' + num + ' sudah habis digunakan!');
      return;
    }
    this.selectedNumber = num;
    this.clearError();
  }

  // Saat sel diklik
  onCellClick(row: number, col: number): void {
    // Jika sel adalah puzzle awal (fixed), tidak bisa diubah
    if (this.initialGrid[row][col] !== 0) {
      this.showError('Sel ini adalah petunjuk awal, tidak bisa diubah.');
      return;
    }
    // Jika belum pilih angka
    if (this.selectedNumber === null) {
      this.showError('Silakan pilih angka terlebih dahulu!');
      return;
    }

    const num = this.selectedNumber;
    // Cek apakah angka sudah habis
    if (this.numberCounts[num] >= 9) {
      this.showError('Angka ' + num + ' sudah habis digunakan!');
      this.selectedNumber = null; // reset pilihan
      return;
    }

    // Jika sel sudah berisi angka, kita bisa timpa? lebih baik biarkan tidak bisa timpa.
    if (this.grid[row][col] !== 0) {
      this.showError('Sel ini sudah terisi. Hapus dulu jika ingin mengubah.');
      return;
    }

    // Cek validitas penempatan
    if (!this.isValidInContext(this.grid, row, col, num)) {
      this.showError('Penempatan angka ' + num + ' di sini melanggar aturan Sudoku!');
      // Tandai error pada sel tersebut
      this.errors[row][col] = true;
      // Hilangkan error setelah 2 detik
      setTimeout(() => {
        this.errors[row][col] = false;
      }, 2000);
      return;
    }

    // Tempatkan angka
    this.grid[row][col] = num;
    this.errors[row][col] = false; // hapus error jika ada
    this.updateNumberCounts();
    this.selectedNumber = null; // setelah menempatkan, reset pilihan angka
    this.clearError();

    // Cek apakah permainan selesai (semua sel terisi)
    if (this.isGridComplete()) {
      alert('Selamat! Anda berhasil menyelesaikan Sudoku! 🎉');
    }
  }

  // Cek apakah grid sudah terisi semua (tidak ada 0)
  private isGridComplete(): boolean {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (this.grid[r][c] === 0) return false;
    return true;
  }

  // Menampilkan pesan error (toast)
  private showError(msg: string): void {
    this.errorMessage = msg;
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }

  private clearError(): void {
    this.errorMessage = null;
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }

  // Fungsi untuk menghapus angka dari sel (dengan klik kanan atau tombol hapus)
  // Kita bisa tambahkan tombol "Hapus" atau klik kanan.
  // Untuk sederhana, kita tambahkan tombol hapus di samping angka.
  clearSelectedCell(row: number, col: number): void {
    if (this.initialGrid[row][col] !== 0) {
      this.showError('Sel ini adalah petunjuk awal, tidak bisa dihapus.');
      return;
    }
    if (this.grid[row][col] === 0) return;
    this.grid[row][col] = 0;
    this.errors[row][col] = false;
    this.updateNumberCounts();
  }

  // Solve otomatis
  solve(): void {
    const board = this.copyGrid(this.grid);
    if (this.solveSudoku(board)) {
      this.grid = board;
      this.errors = this.createEmptyGrid().map(() => Array(9).fill(false));
      this.updateNumberCounts();
      this.selectedNumber = null;
      this.clearError();
    } else {
      this.showError('Tidak ada solusi untuk puzzle ini!');
    }
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

  // Untuk mengecek apakah tombol angka disabled (habis)
  isNumberDisabled(num: number): boolean {
    return this.numberCounts[num] >= 9;
  }

  // Untuk menampilkan sisa angka
  getRemainingCount(num: number): number {
    return 9 - this.numberCounts[num];
  }
}