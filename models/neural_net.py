import sys
import os
import numpy as np

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import ML_FEATURE_NAMES
from models.features import load_and_prepare

# Set random seeds before any model is built (both PyTorch and NumPy)
torch.manual_seed(42)
np.random.seed(42)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(42)

class SkillForgeNet(nn.Module):
    """3-layer PyTorch MLP classifier for student learning styles."""
    def __init__(self, input_dim: int | None = None):
        super().__init__()
        input_dim = input_dim or len(ML_FEATURE_NAMES)
        self.layer1 = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3)
        )
        self.layer2 = nn.Sequential(
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        self.layer3 = nn.Linear(32, 4)
        
    def forward(self, x):
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        return x

def main():
    # 2. Call load_and_prepare
    X_train, X_test, y_train, y_test, scaler, label_encoder = load_and_prepare()
    
    # 3. Convert to PyTorch tensors
    X_train_t = torch.FloatTensor(X_train)
    y_train_t = torch.LongTensor(y_train)
    X_test_t = torch.FloatTensor(X_test)
    y_test_t = torch.LongTensor(y_test)
    
    train_dataset = TensorDataset(X_train_t, y_train_t)
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    
    # Instantiate the network
    model = SkillForgeNet()
    
    # 5. Training config
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()
    
    epochs = 80
    for epoch in range(1, epochs + 1):
        model.train()
        epoch_loss = 0.0
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * len(batch_x)
            
        if epoch % 20 == 0:
            avg_loss = epoch_loss / len(X_train)
            print(f"Epoch {epoch}/80 - Loss: {avg_loss:.4f}")
            
    # 6. Evaluation after training
    model.eval()
    with torch.no_grad():
        test_outputs = model(X_test_t)
        _, predicted = torch.max(test_outputs, 1)
        correct = (predicted == y_test_t).sum().item()
        accuracy = correct / len(y_test_t)
        print(f"Neural Net - Test accuracy: {accuracy:.2f}")
        
    # 7. Save model to 'models/saved'
    os.makedirs("models/saved", exist_ok=True)
    torch.save(model.state_dict(), "models/saved/nn_model.pt")
    torch.save(model, "models/saved/nn_model_full.pt")

if __name__ == "__main__":
    main()
