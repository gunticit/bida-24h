<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Menu;
use App\Models\TakeawayOrder;
use Laravel\Sanctum\Sanctum;

class TakeawayInventoryTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $menu;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Tạo user để authentication
        $this->user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($this->user);

        // Tạo menu item với số lượng
        $this->menu = Menu::create([
            'name' => 'Test Takeaway Item',
            'price' => 50000,
            'quantity' => 10, // Có 10 sản phẩm trong kho
            'category' => 'takeaway',
            'is_active' => true
        ]);
    }

    public function test_can_create_order_with_sufficient_inventory()
    {
        $response = $this->postJson('/api/takeaway-orders', [
            'customer_name' => 'Test Customer',
            'customer_phone' => '0123456789',
            'items' => [
                [
                    'menu_id' => $this->menu->id,
                    'quantity' => 5 // Đặt 5 sản phẩm (< 10)
                ]
            ]
        ]);

        $response->assertStatus(201);
        
        // Kiểm tra số lượng menu đã được trừ
        $this->menu->refresh();
        $this->assertEquals(5, $this->menu->quantity); // 10 - 5 = 5
        
        // Kiểm tra order được tạo đúng
        $order = TakeawayOrder::first();
        $this->assertEquals(250000, $order->total_amount); // 5 * 50000 = 250000
    }

    public function test_cannot_create_order_with_insufficient_inventory()
    {
        $response = $this->postJson('/api/takeaway-orders', [
            'customer_name' => 'Test Customer',
            'customer_phone' => '0123456789',
            'items' => [
                [
                    'menu_id' => $this->menu->id,
                    'quantity' => 15 // Đặt 15 sản phẩm (> 10)
                ]
            ]
        ]);

        $response->assertStatus(500);
        $response->assertJsonFragment(['error' => "Không đủ số lượng sản phẩm {$this->menu->name}. Số lượng hiện tại: 10, số lượng yêu cầu: 15"]);
        
        // Kiểm tra số lượng menu không thay đổi
        $this->menu->refresh();
        $this->assertEquals(10, $this->menu->quantity);
        
        // Kiểm tra không có order nào được tạo
        $this->assertEquals(0, TakeawayOrder::count());
    }

    public function test_inventory_restored_when_order_cancelled()
    {
        // Tạo order trước
        $order = TakeawayOrder::create([
            'customer_name' => 'Test Customer',
            'customer_phone' => '0123456789',
            'total_amount' => 0,
            'order_date' => now(),
            'status' => 'pending'
        ]);

        $order->items()->create([
            'menu_id' => $this->menu->id,
            'quantity' => 3,
            'price' => $this->menu->price
        ]);

        // Cập nhật total_amount
        $order->update(['total_amount' => 150000]);
        
        // Trừ inventory thủ công (giả lập đã đặt hàng)
        $this->menu->decrement('quantity', 3);
        $this->assertEquals(7, $this->menu->quantity);

        // Hủy đơn hàng
        $response = $this->putJson("/api/takeaway-orders/{$order->id}", [
            'status' => 'cancelled'
        ]);

        $response->assertStatus(200);
        
        // Kiểm tra inventory được hoàn trả
        $this->menu->refresh();
        $this->assertEquals(10, $this->menu->quantity); // 7 + 3 = 10
    }

    public function test_inventory_restored_when_order_deleted()
    {
        // Tạo order trước
        $order = TakeawayOrder::create([
            'customer_name' => 'Test Customer',
            'customer_phone' => '0123456789',
            'total_amount' => 150000,
            'order_date' => now(),
            'status' => 'pending'
        ]);

        $order->items()->create([
            'menu_id' => $this->menu->id,
            'quantity' => 3,
            'price' => $this->menu->price
        ]);

        // Trừ inventory thủ công (giả lập đã đặt hàng)
        $this->menu->decrement('quantity', 3);
        $this->assertEquals(7, $this->menu->quantity);

        // Xóa đơn hàng
        $response = $this->deleteJson("/api/takeaway-orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Order deleted successfully and inventory restored']);
        
        // Kiểm tra inventory được hoàn trả
        $this->menu->refresh();
        $this->assertEquals(10, $this->menu->quantity); // 7 + 3 = 10
        
        // Kiểm tra order đã bị xóa
        $this->assertEquals(0, TakeawayOrder::count());
    }

    public function test_multiple_items_inventory_check()
    {
        // Tạo thêm menu item
        $menu2 = Menu::create([
            'name' => 'Test Item 2',
            'price' => 30000,
            'quantity' => 5,
            'category' => 'takeaway',
            'is_active' => true
        ]);

        // Đặt order với 2 items, 1 item không đủ số lượng
        $response = $this->postJson('/api/takeaway-orders', [
            'customer_name' => 'Test Customer',
            'customer_phone' => '0123456789',
            'items' => [
                [
                    'menu_id' => $this->menu->id,
                    'quantity' => 5 // OK
                ],
                [
                    'menu_id' => $menu2->id,
                    'quantity' => 8 // Không đủ (chỉ có 5)
                ]
            ]
        ]);

        $response->assertStatus(500);
        
        // Cả 2 menu đều không bị trừ số lượng
        $this->menu->refresh();
        $menu2->refresh();
        $this->assertEquals(10, $this->menu->quantity);
        $this->assertEquals(5, $menu2->quantity);
        
        // Không có order nào được tạo
        $this->assertEquals(0, TakeawayOrder::count());
    }
}
