import { PostCategory } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { categories } from '../data/mockData';
import { Filter, TrendingUp, Clock, Star } from 'lucide-react';

interface FilterPanelProps {
  selectedCategory: PostCategory | 'all';
  onCategoryChange: (category: PostCategory | 'all') => void;
  sortBy: 'relevance' | 'recent' | 'popular';
  onSortChange: (sort: 'relevance' | 'recent' | 'popular') => void;
  showSaved: boolean;
  onShowSavedChange: (show: boolean) => void;
}

export function FilterPanel({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  showSaved,
  onShowSavedChange
}: FilterPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          ตัวกรอง & เรียงลำดับ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">หมวดหมู่</h4>
          <div className="space-y-1">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onCategoryChange('all')}
            >
              ทั้งหมด
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onCategoryChange(cat.value)}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">เรียงตาม</h4>
          <div className="space-y-1">
            <Button
              variant={sortBy === 'relevance' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onSortChange('relevance')}
            >
              <Star className="w-4 h-4 mr-2" />
              ความเกี่ยวข้อง
            </Button>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onSortChange('recent')}
            >
              <Clock className="w-4 h-4 mr-2" />
              ล่าสุด
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onSortChange('popular')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              ยอดนิยม
            </Button>
          </div>
        </div>

        <Button
          variant={showSaved ? 'default' : 'outline'}
          className="w-full"
          onClick={() => onShowSavedChange(!showSaved)}
        >
          {showSaved ? '📌 กำลังดูที่บันทึกไว้' : '📑 ดูที่บันทึกไว้'}
        </Button>
      </CardContent>
    </Card>
  );
}
