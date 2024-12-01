import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star, Award, Shield } from 'lucide-react';

const ReputationScore = ({ score }) => {
  const stars = Array(5).fill(0).map((_, i) => (
    <Star
      key={i}
      className={`w-5 h-5 ${i < Math.floor(score / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
    />
  ));

  return (
    <div className="flex items-center space-x-1">
      {stars}
      <span className="ml-2 text-sm text-gray-600">({score / 20}/5)</span>
    </div>
  );
};

const ReputationCard = ({ reputation }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reputation Score</span>
          {reputation.isVerified && (
            <Shield className="text-green-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <ReputationScore score={reputation.averageScore} />
            <div className="text-sm text-gray-600 mt-1">
              Based on {reputation.ratingCount} ratings
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Verified Skills</h3>
            <div className="grid grid-cols-2 gap-2">
              {reputation.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-blue-50 p-2 rounded"
                >
                  <Award className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Recent Reviews</h3>
            <div className="space-y-2">
              {reputation.recentReviews.map((review, index) => (
                <div key={index} className="text-sm">
                  <ReputationScore score={review.score} />
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReputationCard;